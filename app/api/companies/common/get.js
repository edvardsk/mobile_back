const { success } = require('api/response');

// formatters
const {
    formatCompanyToResponse,
} = require('formatters/companies');

const geCommonData = async (req, res, next) => {
    try {
        const { company } = res.locals;
        const formattedCompany = formatCompanyToResponse(company);

        return success(res, { company: formattedCompany });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    geCommonData,
};
