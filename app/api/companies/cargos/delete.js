const { success, reject } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;

const removeCargo = async (req, res, next) => {
    try {
        const { cargoId } = req.params;

        const cargoFromDb = await CargosServices.getRecord(cargoId);

        const countCargos = cargoFromDb[colsCargos.COUNT];
        const countFreeCargos = cargoFromDb[colsCargos.FREE_COUNT];

        if (countCargos !== countFreeCargos) {
            return reject(res, ERRORS.CARGOS.UNABLE_TO_DELETE);
        }

        await CargosServices.markAsDeleted(cargoId);

        return success(res, { cargoId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    removeCargo,
};
