const  { one } = require('db');

// sql-helpers
const {
    selectCurrencyById,
} = require('sql-helpers/currencies');

const getCurrencyStrict = id => one(selectCurrencyById(id));

module.exports = {
    getCurrencyStrict,
};
