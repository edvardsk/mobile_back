const squel = require('squel');
const { SQL_TABLES } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.SKILLS;

const cols = table.COLUMNS;

const insertSkills = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const selectSkills = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectSkillsByUser = userId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .toString();

const updateSkills = (id, data) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(data)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

module.exports = {
    insertSkills,
    selectSkills,
    selectSkillsByUser,
    updateSkills,
};
