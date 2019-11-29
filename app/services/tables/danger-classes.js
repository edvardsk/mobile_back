const  { oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectRecordById,
    selectRecords,
} = require('sql-helpers/danger-classes');

const getRecord = id => oneOrNone(selectRecordById(id));

const getRecordStrict = id => oneOrNone(selectRecordById(id));

const getRecords = () => manyOrNone(selectRecords());

const checkRecordExists = async (schema, id) => {
    const dangerClass = await getRecord(id);
    return !!dangerClass;
};

module.exports = {
    getRecord,
    getRecordStrict,
    getRecords,
    checkRecordExists,
};
