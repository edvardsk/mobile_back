const { success } = require('api/response');

// services
const CarsService = require('services/tables/cars');
const FilesService = require('services/tables/files');

// formatters
const { formatRecordForUnauthorizedResponse } = require('formatters/cars');

const getCarUnauthorized = async (req, res, next) => {
    try {
        const { carId } = req.params;
        const car = await CarsService.getRecordFullStrict(carId);
        const formattedData = formatRecordForUnauthorizedResponse(car);

        formattedData.files = await FilesService.formatTemporaryLinks(formattedData.files);

        return success(res, { ...formattedData });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCarUnauthorized,
};
