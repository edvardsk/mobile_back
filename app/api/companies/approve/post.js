const { success, reject } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const UsersService = require('services/tables/users');
const UsersRolesService = require('services/tables/users-to-roles');
const TablesService = require('services/tables');

// constants
const { ROLES, MAP_FROM_PENDING_ROLE_TO_MAIN } = require('constants/system');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { SUCCESS_CODES } = require('constants/http-codes');
const { ERRORS } = require('constants/errors');

const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

// formatters
const { formatDataToApprove } = require('formatters/companies');

const approveCompany = async (req, res, next) => {
    try {
        const { companyId } = req.params;

        const company = await CompaniesService.getCompanyStrict(companyId);

        if (company[colsCompanies.PRIMARY_CONFIRMED] && company[colsCompanies.EDITING_CONFIRMED]) {
            return reject(res, ERRORS.COMPANIES.APPROVED);
        }

        const dataToApprove = formatDataToApprove();

        const transactionsList = [
            CompaniesService.updateCompanyAsTransaction(companyId, dataToApprove),
        ];

        if (
            !company[colsCompanies.PRIMARY_CONFIRMED] &&
            [ROLES.INDIVIDUAL_FORWARDER, ROLES.SOLE_PROPRIETOR_FORWARDER].includes(company[HOMELESS_COLUMNS.HEAD_ROLE_NAME])
        ) {
            const firstUser = await UsersService.getFirstUserInCompanyStrict(companyId);
            const firstUserRole = firstUser[HOMELESS_COLUMNS.ROLE];
            const nextUserRole = MAP_FROM_PENDING_ROLE_TO_MAIN[firstUserRole];
            transactionsList.push(
                UsersRolesService.updateUserRoleAsTransaction(firstUser.id, nextUserRole)
            );
        }

        await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.NOT_CONTENT);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    approveCompany,
};
