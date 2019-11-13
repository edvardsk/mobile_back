const { success } = require('api/response');

// services
const VehicleTypesService = require('services/tables/vehicle-types');

const getTypes = async (req, res, next) => {
    try {
        const types = await VehicleTypesService.getRecords();
        return success(res, { types });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTypes,
};
