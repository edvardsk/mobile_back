// constants
const { SqlArray } = require('constants/instances');
const { DOCUMENTS_SET, FILES_GROUPS } = require('constants/files');
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.FILES.COLUMNS;

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

const formatFilesForResponse = files => files.map(file => (
    formatFileForResponse(file)
));

const formatFileForResponse = file => ({
    id: file.id,
    [cols.NAME]: file[cols.NAME],
    [cols.URL]: file[cols.URL],
    [cols.LABELS]: file[cols.LABELS],
    [cols.CREATED_AT]: file[cols.CREATED_AT],

});

module.exports = {
    formatStoringFile,
    unformatStoringFile,
    formatLabelsToStore,
    formatFilesForResponse,
};
