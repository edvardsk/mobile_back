const { success } = require('api/response');

// services
const CargosServices = require('services/tables/cargos');
const CargoPointsService = require('services/tables/cargo-points');
const TablesService = require('services/tables');

// formatters
const CargosFormatters = require('formatters/cargos');
const CargoPointsFormatters = require('formatters/cargo-points');

const editCargo = async (req, res, next) => {
    try {
        const { body } = req;
        const { cargoId } = req.params;

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
