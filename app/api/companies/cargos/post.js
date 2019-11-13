const uuid = require('uuid/v4');
const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const TablesService = require('services/tables');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;

const createCargo = async (req, res, next) => {
    try {
        const { body } = req;
        const { company } = res.locals;
        const companyId = company.id;

        const CARGOS_PROPS = new Set([
            colsCargos.UPLOADING_DATE_FROM,
            colsCargos.UPLOADING_DATE_TO,
            colsCargos.DOWNLOADING_DATE_FROM,
            colsCargos.DOWNLOADING_DATE_TO,
            colsCargos.GROSS_WEIGHT,
            colsCargos.WIDTH,
            colsCargos.HEIGHT,
            colsCargos.LENGTH,
            colsCargos.LOADING_METHODS,
            colsCargos.LOADING_TYPE,
            colsCargos.GUARANTEES,
            colsCargos.DANGER_CLASS_ID,
            colsCargos.VEHICLE_TYPE_ID,
            colsCargos.PACKING_DESCRIPTION,
            colsCargos.DESCRIPTION,
        ]);

        const CARGO_POINTS_PROPS = new Set([
            HOMELESS_COLUMNS.UPLOADING_POINTS,
            HOMELESS_COLUMNS.DOWNLOADING_POINTS,
        ]);

        const cargosProps = {};
        const cargoPointsProps = {};
        Object.keys(body).forEach(key => {
            if (CARGOS_PROPS.has(key)) {
                cargosProps[key] = body[key];
            } else if (CARGO_POINTS_PROPS.has(key)) {
                cargoPointsProps[key] = body[key];
            }
        });

        const cargoId = uuid();

        const cargo = CargosFormatters.formatRecordToSave(companyId, cargoId, cargosProps);
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
