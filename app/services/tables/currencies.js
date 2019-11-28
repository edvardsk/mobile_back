const  { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectCurrencyById,
    selectCurrencies,
    selectCurrenciesByIds,
} = require('sql-helpers/currencies');

// constants
const { SQL_TABLES } = require('constants/tables');

const colsCargoPrices = SQL_TABLES.CARGO_PRICES.COLUMNS;

const getCurrencyStrict = id => one(selectCurrencyById(id));

const getCurrency = id => oneOrNone(selectCurrencyById(id));

const getCurrencies = () => manyOrNone(selectCurrencies());

const getCurrenciesByIds = ids => manyOrNone(selectCurrenciesByIds(ids));

const checkRecordExists = async (schema, id) => {
    const currency = await getCurrency(id);
    return !!currency;
};

const checkRecordsExists = async (schema, prices) => {
    const ids = prices.map(price => price[colsCargoPrices.CURRENCY_ID]);
    const currencies = await getCurrenciesByIds(ids);
    return currencies.length === prices.length;
};

module.exports = {
    getCurrencyStrict,
    getCurrencies,

    checkRecordExists,
    checkRecordsExists,
};
