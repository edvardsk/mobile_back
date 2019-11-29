const { success, reject } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const CargoPricesService = require('services/tables/cargo-prices');
const TablesService = require('services/tables');
const PointsService = require('services/tables/points');
const BackgroundService = require('services/background/creators');
const PointTranslationsService = require('services/tables/point-translations');
const LanguagesService = require('services/tables/languages');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');
const CargoPricesFormatters = require('formatters/cargo-prices');
const PointsFormatters = require('formatters/points');

// constants
const { CARGO_STATUSES_MAP } = require('constants/cargo-statuses');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { DEFAULT_LANGUAGE } = require('constants/languages');

const colsCargoPoints = SQL_TABLES.CARGO_POINTS.COLUMNS;
const colsPoints = SQL_TABLES.POINTS.COLUMNS;
const colsTranslations = SQL_TABLES.POINT_TRANSLATIONS.COLUMNS;

const editCargo = async (req, res, next) => {
    try {
        const { body } = req;
        const { cargoId } = req.params;
        const { isControlRole } = res.locals;
        const cargoFromDb = await CargosServices.getRecord(cargoId);
        const currentCargoStatus = cargoFromDb[HOMELESS_COLUMNS.STATUS];

        if (!isControlRole && currentCargoStatus !== CARGO_STATUSES_MAP.NEW) {
            return reject(res, ERRORS.CARGOS.UNABLE_TO_EDIT);
        }

        const { cargosProps, cargoPointsProps } = CargosFormatters.formatCargoData(body);

        const cargo = CargosFormatters.formatRecordToEdit(cargosProps);
        const cargoPointsWithName = CargoPointsFormatters.formatRecordsWithName(cargoId, cargoPointsProps);
        const cargoPoints = CargoPointsFormatters.formatRecordsToSave(cargoPointsWithName);
        const cargoPrices = CargoPricesFormatters.formatRecordsToSave(body[HOMELESS_COLUMNS.PRICES], cargoId);

        const cargoCoordinates = cargoPointsWithName.map(record => ({
            [colsCargoPoints.COORDINATES]: record[colsCargoPoints.COORDINATES].toPointString(),
            [HOMELESS_COLUMNS.NAME_EN]: record[HOMELESS_COLUMNS.NAME_EN],
        }));

        const storedPoints = await PointsService.getRecordsByPoints(cargoCoordinates.map(record => record[colsCargoPoints.COORDINATES]));

        const pointsToStore = cargoCoordinates.filter(cargoCoordinate => !storedPoints.find(point => point[colsPoints.COORDINATES] === cargoCoordinate[colsCargoPoints.COORDINATES]));

        const transactionsList = [
            CargoPointsService.removeRecordsByCargoIdAsTransaction(cargoId),
            CargoPricesService.removeRecordsByCargoIdAsTransaction(cargoId),
            CargosServices.editRecordAsTransaction(cargoId, cargo),
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

        await TablesService.runTransaction(transactionsList);

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
