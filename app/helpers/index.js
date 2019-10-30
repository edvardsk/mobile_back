const { get } = require('lodash');

// constants
const { ROLES } = require('constants/system');

const extractToken = req => req.body.token
    || get(req, 'headers.authorization', '').replace('Bearer ', '')
    || req.query.token
    || req.headers['x-access-token'];

const isControlRole = role => role === ROLES.ADMIN || role === ROLES.MANAGER;

module.exports = {
    extractToken,
    isControlRole,
};
