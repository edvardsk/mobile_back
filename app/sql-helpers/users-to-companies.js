const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.USERS_TO_COMPANIES;

const insertRecord = values => {
    return squelPostgres
        .insert()
        .into(table.NAME)
        .setFields(values)
        .returning('*')
        .toString();
};

module.exports = {
    insertRecord,
};
