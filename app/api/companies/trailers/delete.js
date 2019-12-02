const { success } = require('api/response');

// services
const TrailersServices = require('services/tables/trailers');
const TablesServices = require('services/tables');

const removeTrailer = async (req, res, next) => {
    try {
        const { trailerId } = req.params;

        await TablesServices.runTransaction([
            TrailersServices.markAsDeletedAsTransaction(trailerId),
            TrailersServices.unlinkTrailerFromCarAsTransaction(trailerId),
        ]);

        return success(res, { trailerId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    removeTrailer,
};
