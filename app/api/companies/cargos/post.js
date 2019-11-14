const uuid = require('uuid/v4');
const { success, reject } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const CargoStatusesService = require('services/tables/cargo-statuses');
const TablesService = require('services/tables');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { CARGO_STATUSES_MAP } = require('constants/cargo-statuses');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

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
        const cargoPoints = CargoPointsFormatters.formatRecordsToSave(cargoId, cargoPointsProps);

        const transactionList = [
            CargosServices.addRecordAsTransaction(cargo),
            CargoPointsService.addRecordsAsTransaction(cargoPoints)
        ];

        await TablesService.runTransaction(transactionList);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCargo,
};
