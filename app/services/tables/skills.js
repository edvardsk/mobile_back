const { one, oneOrNone } = require('db');
const {
    insertSkills,
    selectSkills,
    selectSkillsByUser,
    updateSkills,
} = require('sql-helpers/skills');

const { OPERATIONS } = require('constants/postgres');

const getSkillsByUserId = userId => oneOrNone(selectSkillsByUser(userId));

const addSkills = data => one(insertSkills(data));
const putSkills = (id, data) => one(updateSkills(id, data));

const getSkills = id => oneOrNone(selectSkills(id));

const addRecordsAsTransaction = data => [insertSkills(data), OPERATIONS.ONE];

const updateRecordsAsTransaction = (id, data) => [updateSkills(id, data), OPERATIONS.ONE];

module.exports = {
    addSkills,
    getSkills,
    putSkills,
    getSkillsByUserId,

    addRecordsAsTransaction,
    updateRecordsAsTransaction,
};
