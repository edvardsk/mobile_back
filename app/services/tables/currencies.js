const  { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectCurrencyById,
    selectCurrencies,
} = require('sql-helpers/currencies');

const getCurrencyStrict = id => one(selectCurrencyById(id));

const getCurrency = id => oneOrNone(selectCurrencyById(id));

const getCurrencies = () => manyOrNone(selectCurrencies());

const checkRecordExists = async (schema, id) => {
    const currency = await getCurrency(id);
    return !!currency;
};

module.exports = {
    getCurrencyStrict,
    getCurrencies,

    checkRecordExists,
};
