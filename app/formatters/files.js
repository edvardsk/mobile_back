const formatStoringFile = (bucket, path) => `${bucket}/${path}`;

const unformatStoringFile = string => string.split('/');

module.exports = {
    formatStoringFile,
    unformatStoringFile,
};
