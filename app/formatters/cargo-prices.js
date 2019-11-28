// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const cols = SQL_TABLES.CARGO_PRICES.COLUMNS;

const formatRecordsToSave = (records, cargoId) => records.map((record, i, arr) => {
    const result = {
        [cols.CARGO_ID]: cargoId,
        [cols.PRICE]: record[cols.PRICE],
        [cols.CURRENCY_ID]: record[cols.CURRENCY_ID],
    };
    if (arr[i + 1]) {
        result[cols.NEXT_CURRENCY_ID] = arr[i + 1][cols.CURRENCY_ID];
    } else {
        result[cols.NEXT_CURRENCY_ID] = null;
    }
    return result;
});

const formatPricesQueueByPriority = prices => {
    const result = [];
    let nextRecord = null;
    while (result.length !== prices.length) {
        const record = prices.find(price => price[cols.NEXT_CURRENCY_ID] === nextRecord);
        delete record[cols.NEXT_CURRENCY_ID];
        result.unshift(record);
        nextRecord = record[cols.CURRENCY_ID];
    }
    return result;
};

const formatPricesFromPostgresJSON = prices => formatPricesQueueByPriority(prices.map(price => formatPriceFromPostgresJSON(price)));

const formatPriceFromPostgresJSON = price => {
    const { f1, f2, f3, f4 } = price;
    return {
        [cols.CURRENCY_ID]: f1,
        [cols.NEXT_CURRENCY_ID]: f2,
        [cols.PRICE]: parseFloat(f3),
        [HOMELESS_COLUMNS.CURRENCY_CODE]: f4,
    };
};


module.exports = {
    formatRecordsToSave,
    formatPricesFromPostgresJSON,
};
