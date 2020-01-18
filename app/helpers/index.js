const { get } = require('lodash');

// constants
const extractToken = req => req.body.token
    || get(req, 'headers.authorization', '').replace('Bearer ', '')
    || req.query.token
    || req.headers['x-access-token'];

module.exports = {
    extractToken,
};
