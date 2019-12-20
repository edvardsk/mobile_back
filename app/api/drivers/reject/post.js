const { success, reject } = require('api/response');

// services
const DraftDriversService = require('services/tables/draft-drivers');

// constants
const { ERRORS } = require('constants/errors');

const rejectDraft = async (req, res, next) => {
    try {
        const { driverId } = req.params;
        const { comments } = req.body;

        const draftDriver = await DraftDriversService.getRecordByDriverId(driverId);

        if (!draftDriver) {
            return reject(res, ERRORS.REJECT.NOTHING_TO_REJECT);
        }

        await DraftDriversService.addComments(draftDriver.id, comments);

        return success(res, { driverId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    rejectDraft,
};
