const Ajv = require('ajv');
const { get } = require('lodash');
const { reject } = require('api/response');
const ajv = new Ajv({ allErrors: true });
require('ajv-keywords')(ajv, 'instanceof');

// constants
const { ERRORS } = require('constants/errors');

const validate = (schemeOrGetter, pathToData = 'body') => (req, res, next) => {
    try {
        const data = get(req, pathToData);
        let scheme;
        if (typeof schemeOrGetter === 'function') {
            const params = {
                role: res.locals.user.role,
            };
            scheme = schemeOrGetter(params);
        } else {
            scheme = schemeOrGetter;
        }

        const validate = ajv.compile(scheme);
        const isValidData = validate(data);
        if (!isValidData) {
            return reject(res, ERRORS.VALIDATION.ERROR, validate.errors);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validate,
};
