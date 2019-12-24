const { success, reject } = require('api/response');

// services
const DraftCarsService = require('services/tables/draft-cars');

// constants
const { ERRORS } = require('constants/errors');

const rejectDraft = async (req, res, next) => {
    try {
        const { carId } = req.params;
        const { comments } = req.body;

        const draftCar = await DraftCarsService.getRecordByCarId(carId);

        if (!draftCar) {
            return reject(res, ERRORS.REJECT.NOTHING_TO_REJECT);
        }

        await DraftCarsService.addComments(draftCar.id, comments);

        return success(res, { carId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    rejectDraft,
};
