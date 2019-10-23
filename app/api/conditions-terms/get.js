const { success } = require('api/response');

// formatters

const getConditionsTerms = async (req, res, next) => {
    try {
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getConditionsTerms,
};
