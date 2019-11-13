const { success } = require('api/response');

// services
const CargoStatusesService = require('services/tables/cargo-statuses');

const getStatuses = async (req, res, next) => {
    try {
        const statuses = await CargoStatusesService.getRecords();
        return success(res, { statuses });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStatuses,
};
