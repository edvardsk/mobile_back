const { oneOrNone, manyOrNone } = require('db');
const {
    selectRolesByNames,
    selectRoleById,
} = require('sql-helpers/roles');

const getRolesByNames = names => manyOrNone(selectRolesByNames(names));

const getRole = id => oneOrNone(selectRoleById(id));

const checkRoleExistsOpposite = async (props, id) => {
    const role = await getRole(id);
    return !!role;
};

module.exports = {
    getRolesByNames,
    getRole,
    checkRoleExistsOpposite,
};
