const { one, oneOrNone, manyOrNone } = require('db');
const {
    selectRolesByNames,
    selectRoleById,
    selectRoleByName,
} = require('sql-helpers/roles');

const getRolesByNames = names => manyOrNone(selectRolesByNames(names));

const getRole = id => oneOrNone(selectRoleById(id));

const getRoleByName = name => one(selectRoleByName(name));

const checkRoleExistsOpposite = async (props, id) => {
    const role = await getRole(id);
    return !!role;
};

module.exports = {
    getRolesByNames,
    getRole,
    getRoleByName,

    checkRoleExistsOpposite,
};
