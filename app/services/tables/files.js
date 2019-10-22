const { manyOrNone } = require('db');

// sql-helpers
const {
    insertFiles,
    selectFilesByCompanyId,
    deleteFilesByIds,
} = require('sql-helpers/files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addFilesAsTransaction = data => [insertFiles(data), OPERATIONS.MANY_OR_NONE];

const getFilesByCompanyId = companyId => manyOrNone(selectFilesByCompanyId(companyId));

const removeFilesByIdsAsTransaction = ids => [deleteFilesByIds(ids), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addFilesAsTransaction,
    getFilesByCompanyId,
    removeFilesByIdsAsTransaction,
};
