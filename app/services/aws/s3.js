const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const getObject = (
    bucketName,
    fileName,
) => new Promise((resolve, reject) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };

    s3.getObject(params, (error, data) => {
        if (error) reject(error);
        else resolve(data);
    });
});

const putObject = (
    bucketName,
    fileName,
    body,
    contentType
) => new Promise((resolve, reject) => {
    const params = {
        Body: body,
        Bucket: bucketName,
        Key: fileName,
        ContentType: contentType,
    };
    s3.putObject(params, (error, data) => {
        if (error) reject(error);
        else resolve(data);
    });
});

const headObject = (
    bucketName,
    fileName,
) => new Promise((resolve, reject) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };
    s3.headObject(params, (error, data) => {
        if (error) reject(error);
        else resolve(data);
    });
});

const deleteObject = (
    bucketName,
    fileName,
) => new Promise((resolve, reject) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };

    s3.deleteObject(params, error => {
        if (error) reject (error);
        else resolve();
    });
});

const getSignedUrl = (bucketName, fileName, expiration = 60) => new Promise((resolve) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Expires: expiration,
    };
    const url = s3.getSignedUrl('getObject', params);
    resolve(url);
});

module.exports = {
    getObject,
    putObject,
    headObject,
    deleteObject,
    getSignedUrl,
};
