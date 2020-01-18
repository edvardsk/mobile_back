const jwt = require('jsonwebtoken');
const JWTsecret = 'f4vb8fJu9hE9XfX6szY5awQU/E2OEAdasd2312';
const expirationPeriod = '30d';

const getJWToken = id => jwt.sign(
    { id },
    JWTsecret,
    { expiresIn: expirationPeriod }
);

const decodeJWToken = token => jwt.verify(token, JWTsecret);

const verifyJWToken = token => {
    try {
        jwt.verify(token, JWTsecret);
        return true;
    } catch (error) {
        return false;
    }
};

const extractIdFromToken = token => decodeJWToken(token)
    .then((jwtToken) => jwtToken.id);

module.exports = {
    getJWToken,
    decodeJWToken,
    verifyJWToken,
    extractIdFromToken,
};
