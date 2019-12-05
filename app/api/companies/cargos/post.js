const uuid = require('uuid/v4');
const { success, reject } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const CargoPricesService = require('services/tables/cargo-prices');
const PointsService = require('services/tables/points');
const PointTranslationsService = require('services/tables/point-translations');
const LanguagesService = require('services/tables/languages');
const TablesService = require('services/tables');
const BackgroundService = require('services/background/creators');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { DEFAULT_LANGUAGE } = require('constants/languages');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');
const CargoPricesFormatters = require('formatters/cargo-prices');
const PointsFormatters = require('formatters/points');

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsCargoPoints = SQL_TABLES.CARGO_POINTS.COLUMNS;
const colsPoints = SQL_TABLES.POINTS.COLUMNS;
const colsTranslations = SQL_TABLES.POINT_TRANSLATIONS.COLUMNS;

const createCargo = async (req, res, next) => {
    try {
        const { body } = req;
        const { company, isControlRole } = res.locals;
        const companyId = company.id;

        if (!isControlRole && !company[colsCompanies.PRIMARY_CONFIRMED]) {
            const cargos = await CargosServices.getRecordsByCompanyId(companyId);
            if (cargos.length) {
                return reject(res, ERRORS.CARGOS.UNABLE_TO_CREATE);
            }
        }

        const { cargosProps, cargoPointsProps } = CargosFormatters.formatCargoData(body);

        const cargoId = uuid();

        const cargo = CargosFormatters.formatRecordToSave(companyId, cargoId, cargosProps);
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
            CargosServices.addRecordAsTransaction(cargo),
            CargoPointsService.addRecordsAsTransaction(cargoPoints),
            CargoPricesService.addRecordsAsTransaction(cargoPrices),
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
                    BackgroundService.translateCoordinatesCreator(translate[colsTranslations.POINT_ID], language))
                );
                return [...acc, translations];
            }, []));
        }

        // todo: notify clients about creating new cargo
        return success(res, { id: cargoId }, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCargo,
};
