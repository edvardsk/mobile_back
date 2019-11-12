const { success, reject } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');

// formatters
const {
    formatCompanyToResponse,
} = require('formatters/companies');

// constants
const { ERRORS } = require('constants/errors');

const geCommonData = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const { isControlRole } = res.locals.user;
        const { shadowUserId } = res.locals;

        let companyHeadId;
        if (isControlRole) {
            companyHeadId = shadowUserId;
        } else {
            companyHeadId = currentUserId;
        }

        const company = await CompaniesService.getCompanyByUserId(companyHeadId);
        if (!company) {
            return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
        }

        const formattedCompany = formatCompanyToResponse(company);

        return success(res, { company: formattedCompany });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    geCommonData,
};
