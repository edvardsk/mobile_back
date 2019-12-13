const { success, reject } = require('api/response');

// services
const TrailersServices = require('services/tables/trailers');
const TablesServices = require('services/tables');

// constants
const { SQL_TABLES } = require('constants/tables');
const { ERRORS } = require('constants/errors');

// formatters
const TrailersFormatters = require('formatters/trailers');

const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;

const verifyTrailer = async (req, res, next) => {
    try {
        const { trailerId } = req.params;

        const trailer = await TrailersServices.getRecordStrict(trailerId);
        if (trailer[colsTrailers.VERIFIED]) {
            return reject(res, ERRORS.VERIFY.ALREADY_VERIFIED);
        }

        await TablesServices.runTransaction([
            TrailersServices.editRecordAsTransaction(trailerId, TrailersFormatters.formatRecordAsVerified()),
        ]);

        return success(res, { trailerId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyTrailer,
};
