const { success } = require('api/response');
const mammoth = require('mammoth');

// services
const S3Service = require('services/aws/s3');

const { AWS_S3_BUCKET_NAME, AWS_S3_CONDITIONS_AND_TERMS_FILE } = process.env;

const addConditionsTerms = async (req, res, next) => {
    try {
        const { body } = req;
        const { value } = await mammoth.convertToHtml({ buffer: body });
        await S3Service.putObject(AWS_S3_BUCKET_NAME, AWS_S3_CONDITIONS_AND_TERMS_FILE, value);
        return success(res, {});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addConditionsTerms,
};
