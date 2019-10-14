const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.PHONE_PREFIXES.COLUMNS;

const formatPhonePrefixesForResponse = values => values.map(value => formatPhonePrefixForResponse(value));

const formatPhonePrefixForResponse = data => ({
    id: data.id,
    [cols.PREFIX]: data[cols.PREFIX],
    [cols.CODE]: `+${data[cols.CODE]}`,
});

module.exports = {
    formatPhonePrefixesForResponse,
};
