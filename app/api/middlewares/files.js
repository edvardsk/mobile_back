const multer  = require('multer');
const { groupBy } = require('lodash');
const { reject } = require('api/response');

const { REQUEST_FILES_COUNT } = process.env;

// constants
const { ERRORS } = require('constants/errors');

const formDataHandler = (handler) => (req, res, next) => handler(req, res, (error) => {
    if (error instanceof multer.MulterError) {
        logger.error(error);
        return reject(res, ERRORS.FILES.UPLOADING_ERROR, error);
    } else if (error) {
        next(error);
    } else if (req.files.length > +REQUEST_FILES_COUNT) {
        return reject(res, ERRORS.FILES.TOO_MUCH_FILES);
    } else {
        req.files = groupBy(req.files, 'fieldname');
        next();
    }
});

module.exports = {
    formDataHandler,
};
