const { success } = require('api/response');

const getCargos = async (req, res, next) => {
    try {
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCargos,
};
