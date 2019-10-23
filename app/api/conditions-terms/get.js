const { successString } = require('api/response');

// services
const S3Service = require('services/aws/s3');

const { AWS_S3_BUCKET_NAME, AWS_S3_CONDITIONS_AND_TERMS_FILE } = process.env;

const getConditionsTerms = async (req, res, next) => {
    try {
        const s3Object = await S3Service.getObject(AWS_S3_BUCKET_NAME, AWS_S3_CONDITIONS_AND_TERMS_FILE);
        const template = s3Object.Body.toString();
        return successString(res, template);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getConditionsTerms,
};
