const { one, many, oneOrNone } = require('db');

// sql-helpers
const {
    selectRecordByUserId,
    insertRecord,
    insertRecords,
    selectRecordByTwoUsersIds,
    selectRecordByCompanyIdAndUserId,
} = require('sql-helpers/users-to-companies');

// constants
const { OPERATIONS } = require('constants/postgres');
const { SQL_TABLES } = require('constants/tables');

const getRecordByUserIdStrict = userId => one(selectRecordByUserId(userId));

const isUsersFromOneCompany = (user1, user2) => many(selectRecordByTwoUsersIds(user1, user2))
    .then(records => {
        if (records.length === 1) { // the same user
            return true;
        }

        const colsUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES.COLUMNS;
        const [userCompany1, userCompany2] = records;
        return userCompany1 && userCompany2 && userCompany1[colsUsersCompanies.COMPANY_ID] === userCompany2[colsUsersCompanies.COMPANY_ID];
    });

const addRecordAsTransaction = data => [insertRecord(data), OPERATIONS.ONE];

const addRecordsAsTransaction = values => [insertRecords(values), OPERATIONS.MANY];

const hasCompanyUser = async (companyId, userId) => {
    const record = await oneOrNone(selectRecordByCompanyIdAndUserId(companyId, userId));
    return !!record;
};

module.exports = {
    getRecordByUserIdStrict,
    addRecordAsTransaction,
    addRecordsAsTransaction,
    isUsersFromOneCompany,
    hasCompanyUser,
};
