const { success, reject } = require('api/response');

// services
const DraftTrailersService = require('services/tables/draft-trailers');

// constants
const { ERRORS } = require('constants/errors');

const rejectDraft = async (req, res, next) => {
    try {
        const { trailerId } = req.params;
        const { comments } = req.body;

        const draftTrailer = await DraftTrailersService.getRecordByTrailerId(trailerId);

        if (!draftTrailer) {
            return reject(res, ERRORS.REJECT.NOTHING_TO_REJECT);
        }

        await DraftTrailersService.addComments(draftTrailer.id, comments);

        return success(res, { trailerId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    rejectDraft,
};
