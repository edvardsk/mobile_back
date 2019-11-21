const uuid = require('uuid/v4');
const { success, reject } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const CargoStatusesService = require('services/tables/cargo-statuses');
const PointsService = require('services/tables/points');
const PointTranslationsService = require('services/tables/point-translations');
const LanguagesService = require('services/tables/languages');
const TablesService = require('services/tables');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { CARGO_STATUSES_MAP } = require('constants/cargo-statuses');
const { DEFAULT_LANGUAGE } = require('constants/languages');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');
const PointsFormatters = require('formatters/points');

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsCargoPoints = SQL_TABLES.CARGO_POINTS.COLUMNS;
const colsPoints = SQL_TABLES.POINTS.COLUMNS;

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

        const cargoStatusRecord = await CargoStatusesService.getRecordByName(CARGO_STATUSES_MAP.NEW);
        const statusId = cargoStatusRecord.id;

        const cargo = CargosFormatters.formatRecordToSave(companyId, cargoId, statusId, cargosProps);
        const cargoPointsWithName = CargoPointsFormatters.formatRecordsWithName(cargoId, cargoPointsProps);
        const cargoPoints = CargoPointsFormatters.formatRecordsToSave(cargoPointsWithName);

        const cargoCoordinates = cargoPointsWithName.map(record => ({
            [colsCargoPoints.COORDINATES]: record[colsCargoPoints.COORDINATES].toCoordinatesString(),
            [HOMELESS_COLUMNS.NAME_EN]: record[HOMELESS_COLUMNS.NAME_EN],
        }));

        const storedPoints = await PointsService.getRecordsByPoints(cargoCoordinates.map(record => record[colsCargoPoints.COORDINATES]));

        const pointsToStore = cargoCoordinates.filter(cargoCoordinate => !storedPoints.find(point => point[colsPoints.POINT] === cargoCoordinate[colsCargoPoints.COORDINATES]));

        const transactionsList = [
            CargosServices.addRecordAsTransaction(cargo),
            CargoPointsService.addRecordsAsTransaction(cargoPoints),
        ];

        if (pointsToStore.length) {
            const enLanguage = await LanguagesService.getLanguageByCodeStrict(DEFAULT_LANGUAGE);

            const [points, translations] = PointsFormatters.formatPointsAndTranslationsToSave(pointsToStore, enLanguage.id);

            transactionsList.push(
                PointsService.addRecordsAsTransaction(points)
            );
            transactionsList.push(
                PointTranslationsService.addRecordsAsTransaction(translations)
            );
        }

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCargo,
};
