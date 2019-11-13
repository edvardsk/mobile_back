const { success } = require('api/response');

// services
const DangerClassesService = require('services/tables/danger-classes');

const getClasses = async (req, res, next) => {
    try {
        const classes = await DangerClassesService.getRecords();
        return success(res, { classes });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClasses,
};
