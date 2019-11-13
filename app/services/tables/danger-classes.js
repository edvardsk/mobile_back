const  { oneOrNone } = require('db');

// sql-helpers
const {
    selectRecordById,
} = require('sql-helpers/danger-classes');

const getRecord = id => oneOrNone(selectRecordById(id));

const checkRecordExists = async (schema, id) => {
    const country = await getRecord(id);
    return !!country;
};

module.exports = {
    getRecord,
    checkRecordExists,
};
