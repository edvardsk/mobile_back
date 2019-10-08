// sql-helpers
const {
    insertFiles,
} = require('sql-helpers/files');

// constants
const { OPERATIONS } = require('constants/postgres');

const addFilesAsTransaction = data => [insertFiles(data), OPERATIONS.MANY_OR_NONE];

module.exports = {
    addFilesAsTransaction,
};
