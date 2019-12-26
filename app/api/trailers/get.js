const { success } = require('api/response');

// services
const TrailersService = require('services/tables/trailers');
const FilesService = require('services/tables/files');

// formatters
const { formatRecordForUnauthorizedResponse } = require('formatters/trailers');

const getTrailerUnauthorized = async (req, res, next) => {
    try {
        const { trailerId } = req.params;
        const trailer = await TrailersService.getRecordFullStrict(trailerId);
        const formattedData = formatRecordForUnauthorizedResponse(trailer);

        formattedData.files = await FilesService.formatTemporaryLinks(formattedData.files);

        return success(res, { ...formattedData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTrailerUnauthorized,
};
