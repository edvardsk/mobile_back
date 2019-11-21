// this file uses only in boss.js file!

// services
// const S3Service = require('services/aws/s3');

// constants
// const { SQL_TABLES } = require('constants/tables');

const translateCoordinates = async job => {
    logger.info(`received ${job.name} ${job.id}`);
    try {
        // const { pointId, language, originalValue } = job.data;

        await job.done();
        logger.info(`Job completed id: ${job.id}`);

    } catch (err) {
        logger.error(`Job failed id: ${job.id}`);
        await job.done(err);
        onError(err);
    }
};

const onError = error => {
    logger.error(error);
};

module.exports = {
    translateCoordinates,
};
