const { success, reject } = require('api/response');

// services
// const DealsService = require('services/tables/deals');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');
const { ROLES } = require('constants/system');
const { ERRORS } = require('constants/errors');

const setConfirmedStatus = async (req, res, next) => {
    try {
        const { company } = res.locals;

        const headCompanyRole = company[HOMELESS_COLUMNS.HEAD_ROLE_NAME];

        if (headCompanyRole === ROLES.TRANSPORTER) {


        } else if (headCompanyRole === ROLES.HOLDER) {

        } else {
            return reject(res, ERRORS.SYSTEM.ERROR);
        }


        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    setConfirmedStatus,
};
