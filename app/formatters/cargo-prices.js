// constants
const { SQL_TABLES } = require('constants/tables');

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

module.exports = {
    formatRecordsToSave,
};
