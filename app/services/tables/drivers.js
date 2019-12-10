const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    insertRecords,
    selectRecordByUserId,
    updateRecordByUserId,
    selectAvailableDriversPaginationSorting,
    selectCountAvailableDrivers,
    selectRecordByCompanyIdLight,
    selectAvailableDriversByIdsAndCompanyId,
    selectDriversByPhoneNumbers,
} = require('sql-helpers/drivers');

// constants
const { OPERATIONS } = require('constants/postgres');

// helpers
const { isValidUUID } = require('helpers/validators');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const editDriverAsTransaction = (userId, values) => [updateRecordByUserId(userId, values), OPERATIONS.ONE];

const getRecordByUserId = userId => oneOrNone(selectRecordByUserId(userId));

const getAvailableDriversPaginationSorting = (companyId, limit, offset, sortColumn, asc, filter) => (
    manyOrNone(selectAvailableDriversPaginationSorting(companyId, limit, offset, sortColumn, asc, filter))
);

const getCountAvailableDrivers = (companyId, filter) => (
    one(selectCountAvailableDrivers(companyId, filter))
        .then(({ count }) => +count)
);

const getRecordByCompanyIdLight = companyId => oneOrNone(selectRecordByCompanyIdLight(companyId));

const getAvailableDriversByIdsAndCompanyId = (ids, companyId) => (
    manyOrNone(selectAvailableDriversByIdsAndCompanyId(ids, companyId))
);

const getDriversByPhoneNumbers = (numbers) => (
    manyOrNone(selectDriversByPhoneNumbers(numbers))
);

const checkIsOptionalDriverInCompanyExists = async (meta, id) => {
    const { companyId } = meta;
    if (isValidUUID(id)) {
        const driverInCompany = await getRecordByCompanyIdLight(companyId);
        return !!driverInCompany;
    }
    return true;
};

module.exports = {
    addRecordAsTransaction,
    addRecordsAsTransaction,
    editDriverAsTransaction,
    getRecordByUserId,
    getAvailableDriversPaginationSorting,
    getCountAvailableDrivers,
    getAvailableDriversByIdsAndCompanyId,
    getDriversByPhoneNumbers,

    checkIsOptionalDriverInCompanyExists,
};
