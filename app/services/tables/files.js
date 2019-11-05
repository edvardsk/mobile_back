const { manyOrNone } = require('db');

// sql-helpers
const {
    insertFiles,
    selectFilesByCompanyId,
    selectFilesByCompanyIdAndLabel,
    selectFilesByCompanyIdAndLabels,
    deleteFilesByIds,
} = require('sql-helpers/files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addFilesAsTransaction = data => [insertFiles(data), OPERATIONS.MANY_OR_NONE];

const getFilesByCompanyId = companyId => manyOrNone(selectFilesByCompanyId(companyId));

const getFilesByCompanyIdAndFileGroup = (companyId, fileGroup) => manyOrNone(selectFilesByCompanyIdAndLabel(companyId, fileGroup));

const getFilesByCompanyIdAndLabels = (companyId, labels) => manyOrNone(selectFilesByCompanyIdAndLabels(companyId, labels));

const removeFilesByIdsAsTransaction = ids => [deleteFilesByIds(ids), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addFilesAsTransaction,
    getFilesByCompanyId,
    getFilesByCompanyIdAndFileGroup,
    getFilesByCompanyIdAndLabels,
    removeFilesByIdsAsTransaction,
};
