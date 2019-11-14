const { success, reject } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const TablesService = require('services/tables');

// constants
const { CARGO_STATUSES_MAP } = require('constants/cargo-statuses');
const { HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');

const removeCargo = async (req, res, next) => {
    try {
        const { cargoId } = req.params;

        const cargoFromDb = await CargosServices.getRecord(cargoId);

        const currentCargoStatus = cargoFromDb[HOMELESS_COLUMNS.STATUS];

        if (currentCargoStatus !== CARGO_STATUSES_MAP.NEW) {
            return reject(res, ERRORS.CARGOS.UNABLE_TO_EDIT);
        }

        const transactionList = [
            CargoPointsService.removeRecordsByCargoIdAsTransaction(cargoId),
            CargosServices.removeRecordAsTransaction(cargoId),
        ];

        await TablesService.runTransaction(transactionList);

        return success(res, { cargoId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    removeCargo,
};
