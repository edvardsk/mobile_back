const  { one, manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordByName,
    selectStatuses,
} = require('sql-helpers/deal-statuses');

const getRecordStrict = name => one(selectRecordByName(name));

const getStatuses = () => manyOrNone(selectStatuses());

module.exports = {
    getRecordStrict,
    getStatuses,
};
