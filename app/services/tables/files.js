const { manyOrNone } = require('db');

// sql-helpers
const {
    insertFiles,
    selectFilesByCompanyId,
    selectFilesByCompanyIdAndTypes,
    deleteFilesByIds,
} = require('sql-helpers/files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addFilesAsTransaction = data => [insertFiles(data), OPERATIONS.MANY_OR_NONE];

const getFilesByCompanyId = companyId => manyOrNone(selectFilesByCompanyId(companyId));

const getFilesByCompanyIdAndTypes = (companyId, types) => manyOrNone(selectFilesByCompanyIdAndTypes(companyId, types));

const removeFilesByIdsAsTransaction = ids => [deleteFilesByIds(ids), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addFilesAsTransaction,
    getFilesByCompanyId,
    getFilesByCompanyIdAndTypes,
    removeFilesByIdsAsTransaction,
};
