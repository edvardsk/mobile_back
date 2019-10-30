const { success, reject } = require('api/response');

// services
const CompaniesService = require('services/tables/companies');
const S3Service = require('services/aws/s3');

// constants
const { ERRORS } = require('constants/errors');

const getNonCustomFiles = async (req, res, next) => {
    try {
        const currentUserId = res.locals.user.id;
        const isControlRole = res.locals.user.isControlRole;

        // const { meOrId } = req.params;
        // let company;
        //
        // if (isControlRole) {
        //     company = await CompaniesService.getCompany(meOrId);
        //     if (!company) {
        //         return reject(res, ERRORS.COMPANIES.INVALID_COMPANY_ID);
        //     }
        // } else {
        //     company = await CompaniesService.getCompanyByUserId(currentUserId);
        // }
        // const file = await S3Service.getSignedUrl('logistlab-files', '2019-09-03 11.19.31.jpg');

        return success(res, { } );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNonCustomFiles,
};
