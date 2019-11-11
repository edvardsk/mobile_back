const { success, reject } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const FilesService = require('services/tables/files');

// constants
const { ERRORS } = require('constants/errors');

const getGroupFiles = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const isControlRole = res.locals.user.isControlRole;

        const { meOrId, fileGroup } = req.params;

        let company;

        if (isControlRole) {
            company = await CompaniesService.getCompany(meOrId);
            if (!company) {
                return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
            }
        } else {
            company = await CompaniesService.getCompanyByUserId(currentUserId);
        }

        const files = await FilesService.getFilesByCompanyIdAndFileGroup(company.id, fileGroup);

        const resultFiles = await FilesService.formatTemporaryLinks(files);

        return success(res, { files: resultFiles } );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGroupFiles,
};
