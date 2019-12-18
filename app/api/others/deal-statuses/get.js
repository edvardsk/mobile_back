const { success } = require('api/response');

// services
const DealStatusesService = require('services/tables/deal-statuses');

const getStatuses = async (req, res, next) => {
    try {
        const statuses = await DealStatusesService.getStatuses();
        return success(res, { statuses });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStatuses,
};
