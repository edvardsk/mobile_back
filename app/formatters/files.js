// constants
const { SqlArray } = require('constants/instances');
const { DOCUMENTS_SET, FILES_GROUPS } = require('constants/files');

const formatStoringFile = (bucket, path) => `${bucket}/${path}`;

const unformatStoringFile = string => string.split('/');

const formatLabelsToStore = string => {
    const labels = [];
    const splitLabels = string.split('.');
    const possibleBasicLabel = splitLabels.shift();
    if (DOCUMENTS_SET.has(possibleBasicLabel) && splitLabels.length) {
        labels.push(possibleBasicLabel);
        labels.push(FILES_GROUPS.BASIC);
        labels.push(splitLabels.toString());
    } else if (DOCUMENTS_SET.has(possibleBasicLabel)) {
        labels.push(possibleBasicLabel);
        labels.push(FILES_GROUPS.BASIC);
    } else {
        labels.push(string);
        labels.push(FILES_GROUPS.CUSTOM);
    }

    return new SqlArray(labels);
};

module.exports = {
    formatStoringFile,
    unformatStoringFile,
    formatLabelsToStore,
};
