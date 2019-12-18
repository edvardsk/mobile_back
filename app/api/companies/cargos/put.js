const { success, reject } = require('api/response');
const uuid = require('uuid/v4');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const CargoPricesService = require('services/tables/cargo-prices');
const TablesService = require('services/tables');
const PointsService = require('services/tables/points');
const BackgroundService = require('services/background/creators');
const PointTranslationsService = require('services/tables/point-translations');
const LanguagesService = require('services/tables/languages');
const DirectionsService = require('services/google/directions');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');
const CargoPricesFormatters = require('formatters/cargo-prices');
const PointsFormatters = require('formatters/points');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { DEFAULT_LANGUAGE } = require('constants/languages');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsCargoPoints = SQL_TABLES.CARGO_POINTS.COLUMNS;
const colsPoints = SQL_TABLES.POINTS.COLUMNS;
const colsTranslations = SQL_TABLES.POINT_TRANSLATIONS.COLUMNS;

const editCargo = async (req, res, next) => {
    try {
        const { body } = req;
        const { cargoId } = req.params;
        const { isControlRole, company } = res.locals;
        const companyId = company.id;
        let cargoFromDb = await CargosServices.getRecord(cargoId);

        const countCargos = cargoFromDb[colsCargos.COUNT];
        const countFreeCargos = cargoFromDb[colsCargos.FREE_COUNT];

        let withCopy = false;

        if (!isControlRole && countCargos !== countFreeCargos) {
            if (countFreeCargos > 0) {
                withCopy = true;
                cargoFromDb[colsCargos.COUNT] = countCargos - countFreeCargos;
                cargoFromDb[colsCargos.FREE_COUNT] = 0;
            } else {
                return reject(res, ERRORS.CARGOS.UNABLE_TO_EDIT);
            }
        }

        const { cargosProps, cargoPointsProps } = CargosFormatters.formatCargoData(body);

        const distance = await DirectionsService.getDirection(cargoPointsProps);

        const newCargoId = withCopy ? uuid() : cargoId;

        const cargo = withCopy
            ? CargosFormatters.formatRecordToSave(companyId, newCargoId, cargosProps, distance)
            : CargosFormatters.formatRecordToEdit(cargosProps, distance);

        const cargoPointsWithName = CargoPointsFormatters.formatRecordsWithName(newCargoId, cargoPointsProps);
        const cargoPoints = CargoPointsFormatters.formatRecordsToSave(cargoPointsWithName);
        const cargoPrices = CargoPricesFormatters.formatRecordsToSave(body[HOMELESS_COLUMNS.PRICES], newCargoId);

        const cargoCoordinates = cargoPointsWithName.map(record => ({
            [colsCargoPoints.COORDINATES]: record[colsCargoPoints.COORDINATES].toPointString(),
            [HOMELESS_COLUMNS.NAME_EN]: record[HOMELESS_COLUMNS.NAME_EN],
        }));

        const storedPoints = await PointsService.getRecordsByPoints(cargoCoordinates.map(record => record[colsCargoPoints.COORDINATES]));

        const pointsToStore = cargoCoordinates.filter(cargoCoordinate => !storedPoints.find(point => point[colsPoints.COORDINATES] === cargoCoordinate[colsCargoPoints.COORDINATES]));

        let oldCargo;

        if (withCopy) {
            const { cargosProps: oldCargosProps } = CargosFormatters.formatCargoData(cargoFromDb);
            oldCargo = CargosFormatters.formatRecordToEdit(oldCargosProps, cargoFromDb[colsCargos.DISTANCE]);
            oldCargo[colsCargos.COUNT] = cargoFromDb[colsCargos.COUNT];
            oldCargo[colsCargos.FREE_COUNT] = cargoFromDb[colsCargos.FREE_COUNT];
            delete oldCargo.id;
        }

        const editTransactionsList = [
            CargoPointsService.removeRecordsByCargoIdAsTransaction(cargoId),
            CargoPricesService.removeRecordsByCargoIdAsTransaction(cargoId),
            CargosServices.editRecordAsTransaction(newCargoId, cargo),
        ];

        const createTransactionsList = [
            CargosServices.addRecordAsTransaction(cargo),
            CargosServices.editRecordAsTransaction(cargoId, oldCargo),
        ];

        const transactionsList = [
            CargoPointsService.addRecordsAsTransaction(cargoPoints),
            CargoPricesService.addRecordsAsTransaction(cargoPrices)
        ];

        let translationsList = [];
        if (pointsToStore.length) { // store new point on default language (en)
            const enLanguage = await LanguagesService.getLanguageByCodeStrict(DEFAULT_LANGUAGE);

            const [points, translations] = PointsFormatters.formatPointsAndTranslationsToSave(pointsToStore, enLanguage.id);

            translationsList = [...translations];

            transactionsList.push(
                PointsService.addRecordsAsTransaction(points)
            );
            transactionsList.push(
                PointTranslationsService.addRecordsAsTransaction(translations)
            );
        }

        await TablesService.runTransaction([...(withCopy ? createTransactionsList : editTransactionsList), ...transactionsList]);

        if (translationsList.length) {
            const languages = await LanguagesService.getLanguagesWithoutEng();
            await Promise.all(translationsList.reduce((acc, translate) => {
                const translations = languages.map(language => (
                    BackgroundService.translateCoordinatesCreator(translate[colsTranslations.POINT_ID], language, translate[colsTranslations.VALUE]))
                );
                return [...acc, translations];
            }, []));
        }

        return success(res, { cargoId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editCargo,
};
