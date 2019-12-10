const  { one } = require('db');

// sql-helpers
const {
    selectRecordByName,
} = require('sql-helpers/deal-statuses');

const getRecordStrict = name => one(selectRecordByName(name));

module.exports = {
    getRecordStrict,
};
