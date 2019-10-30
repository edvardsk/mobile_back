const { success } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');

// helpers
const { isValidUUID } = require('helpers/validators');

// formatters
const { formatLegalDataForResponse } = require('formatters/companies');

const getLegalData = async (req, res, next) => {
    try {
        const userId = res.locals.user.id;
        const { meOrId } = req.params;
        let company;

        if (isValidUUID(meOrId)) {
            company = await CompaniesService.getCompany(meOrId);
        } else {
            company = await CompaniesService.getCompanyByUserId(userId);
        }

        return success(res, { company: formatLegalDataForResponse(company) });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLegalData,
};
