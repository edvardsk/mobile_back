const  { oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordById,
    selectRecords,
} = require('sql-helpers/danger-classes');

const getRecord = id => oneOrNone(selectRecordById(id));

const getRecords = () => manyOrNone(selectRecords());

const checkRecordExists = async (schema, id) => {
    const country = await getRecord(id);
    return !!country;
};

module.exports = {
    getRecord,
    getRecords,
    checkRecordExists,
};
