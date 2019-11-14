const { success, reject } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const TablesService = require('services/tables');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');

// constants
const { CARGO_STATUSES_MAP } = require('constants/cargo-statuses');
const { HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');

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
        const cargoPoints = CargoPointsFormatters.formatRecordsToSave(cargoId, cargoPointsProps);

        const transactionList = [
            CargoPointsService.removeRecordsByCargoIdAsTransaction(cargoId),
            CargosServices.editRecordAsTransaction(cargoId, cargo),
            CargoPointsService.addRecordsAsTransaction(cargoPoints)
        ];

        await TablesService.runTransaction(transactionList);

        return success(res, { cargoId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editCargo,
};
