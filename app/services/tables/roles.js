const { oneOrNone, manyOrNone } = require('db');
const {
    selectRolesByNames,
    selectRoleById,
} = require('sql-helpers/roles');

const getRolesByNames = names => manyOrNone(selectRolesByNames(names));

const getRole = id => oneOrNone(selectRoleById(id));

module.exports = {
    getRolesByNames,
    getRole,
};
