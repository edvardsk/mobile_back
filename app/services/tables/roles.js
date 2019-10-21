const { oneOrNone, manyOrNone } = require('db');
const {
    selectRolesByNames,
    selectRoleById,
} = require('sql-helpers/roles');

// helpers
const { isValidUUID } = require('helpers/validators');

const getRolesByNames = names => manyOrNone(selectRolesByNames(names));

const getRole = id => oneOrNone(selectRoleById(id));

const checkRoleExists = async (props, id) => {
    if (!isValidUUID(id)) {
        return true; // will be caught by pattern
    }
    const role = await getRole(id);
    return !!role;
};

module.exports = {
    getRolesByNames,
    getRole,
    checkRoleExists,
};
