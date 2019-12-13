const { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    insertRecord,
    insertRecords,
    selectRecordByUserId,
    selectRecordById,
    updateRecordByUserId,
    updateRecord,
    selectAvailableDriversPaginationSorting,
    selectCountAvailableDrivers,
    selectRecordByCompanyIdLight,
    selectAvailableDriversByIdsAndCompanyId,
    selectAvailableDriverByIdAndCompanyId,
    selectDriversByPhoneNumbers,
} = require('sql-helpers/drivers');

// constants
const { OPERATIONS } = require('constants/postgres');

// helpers
const { isValidUUID } = require('helpers/validators');

const addRecordAsTransaction = values => [insertRecord(values), OPERATIONS.ONE];

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const editDriverByUserIdAsTransaction = (userId, values) => [updateRecordByUserId(userId, values), OPERATIONS.ONE];

const editDriverAsTransaction = (id, values) => [updateRecord(id, values), OPERATIONS.ONE];

const getRecordByUserId = userId => oneOrNone(selectRecordByUserId(userId));

const getRecordStrict = id => one(selectRecordById(id));

const getRecord = id => oneOrNone(selectRecordById(id));


const getAvailableDriversPaginationSorting = (companyId, cargoDates, limit, offset, sortColumn, asc, filter) => {
    return manyOrNone(selectAvailableDriversPaginationSorting(companyId, cargoDates, limit, offset, sortColumn, asc, filter));
};

const getCountAvailableDrivers = (companyId, cargoId, filter) => (
    one(selectCountAvailableDrivers(companyId, cargoId, filter))
        .then(({ count }) => +count)
);

const getRecordByCompanyIdLight = companyId => oneOrNone(selectRecordByCompanyIdLight(companyId));

const getAvailableDriversByIdsAndCompanyId = (ids, companyId) => (
    manyOrNone(selectAvailableDriversByIdsAndCompanyId(ids, companyId))
);

const getAvailableDriverByIdAndCompanyId = (id, companyId) => (
    oneOrNone(selectAvailableDriverByIdAndCompanyId(id, companyId))
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

const checkDriverExists = async (meta, id) => {
    const driver = await getRecord(id);
    return !!driver;
};

module.exports = {
    addRecordAsTransaction,
    addRecordsAsTransaction,
    editDriverByUserIdAsTransaction,
    editDriverAsTransaction,
    getRecordByUserId,
    getRecordStrict,
    getAvailableDriversPaginationSorting,
    getCountAvailableDrivers,
    getAvailableDriversByIdsAndCompanyId,
    getAvailableDriverByIdAndCompanyId,
    getDriversByPhoneNumbers,

    checkIsOptionalDriverInCompanyExists,
    checkDriverExists,
};
