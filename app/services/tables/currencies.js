const  { one, manyOrNone } = require('db');

// sql-helpers
const {
    selectCurrencyById,
    selectCurrencies,
} = require('sql-helpers/currencies');

const getCurrencyStrict = id => one(selectCurrencyById(id));

const getCurrencies = () => manyOrNone(selectCurrencies());

module.exports = {
    getCurrencyStrict,
    getCurrencies,
};
