const { success } = require('api/response');

const getLegalData = async (req, res, next) => {
    try {

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLegalData,
};
