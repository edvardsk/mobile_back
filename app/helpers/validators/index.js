const { isString } = require('lodash');

const MAX_SAFE_POSTGRES = 2147483647;

const isValidUUID = uuid => isString(uuid)
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);

const isStrongEnoughPassword = password => {
    if (!isString(password)) {
        return 'Password must be a string.';
    }

    if (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
        return null;
    }

    if (!/^.{6,}$/.test(password)) {
        return 'password must be minimum of 6 characters length.';
    }

    if (!/[0-9]/.test(password)) {
        return 'password must contain at least 1 digit.';
    }

    if (!/[A-Za-z]/.test(password)) {
        return 'password must contain at least 1 letter.';
    }
};

const isValidEmail = email => {
    return isString(email) && /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email); //eslint-disable-line
};

const isNaturalNumber = value => Number.isInteger(value) && value > 0 && value <= MAX_SAFE_POSTGRES;

const isNonNegativeNumber = value => Number.isInteger(value) && value >= 0 && value <= MAX_SAFE_POSTGRES;

const isIsoDateString = str => isString(str) && /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/.test(str);

module.exports = {
    isValidUUID,
    isStrongEnoughPassword,
    isValidEmail,
    isNaturalNumber,
    isNonNegativeNumber,
    isIsoDateString,
};
