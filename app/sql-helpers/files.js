const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.FILES;

const insertFiles = values => {
    return squelPostgres
        .insert()
        .into(table.NAME)
        .setFieldsRows(values)
        .returning('*')
        .toString();
};

module.exports = {
    insertFiles,
};
