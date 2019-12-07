const { success, reject } = require('api/response');

const createDeal = async (req, res, next) => {
    try {
        const { company } = res.locals;

        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDeal,
};
