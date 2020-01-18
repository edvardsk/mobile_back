const Ajv = require('ajv');
const { get } = require('lodash');
const { reject } = require('api/response');
const ajv = new Ajv({ allErrors: true, jsonPointers: true, $data: true });
require('ajv-keywords')(ajv);
require('ajv-errors')(ajv);

// services
// const UsersService = require('services/tables/users');

// constants
const { ERRORS } = require('constants/errors');
// const { SQL_TABLES } = require('constants/tables');
// const { ERROR_CODES } = require('constants/http-codes');

// helpers
// const {
//     parseStringToJson,
//     parseStringToFloat,
//     parseStringToInt,
//     parseStringBooleanToBoolean,
//     parsePaginationOptions,
//     compareYears,
//     validateDownloadingDateMinimum,
// } = require('helpers/validators/custom');
// const ValidatorSchemes = require('helpers/validators/schemes');

// const yearRegex = /^[0-9]{1,4}$/;

// ajv.addKeyword('email_exists', {
//     async: true,
//     type: 'string',
//     validate: UsersService.checkUserWithEmailExistsOpposite,
// });

ajv.addFormat('json', {
    type: 'string',
    validate: (string) => {
        try {
            JSON.parse(string);
            return true;
        } catch (error) {
            return false;
        }
    },
});

const validate = (schemeOrGetter, pathToData = 'body') => async (req, res, next) => {
    try {
        let data = {};
        if (Array.isArray(pathToData)) {
            pathToData.forEach(item => {
                data = {
                    ...data,
                    ...get(req, item),
                };
            });
        } else {
            data = get(req, pathToData);
        }

        let scheme;
        if (typeof schemeOrGetter === 'function') {
            const params = {
                userId: res.locals.user.id,
                requestParams: req.params,
                body: req.body,
            };
            scheme = schemeOrGetter(params);
            if (!scheme) {
                return reject(res, {});
            }
        } else {
            scheme = schemeOrGetter;
        }

        const validate = ajv.compile(scheme);
        const isValidData = validate(data);

        if (isValidData.then) {
            try {
                await isValidData;
            } catch (error) {
                return reject(res, ERRORS.VALIDATION.ERROR, error.errors);
            }
        } else if (!isValidData) {
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
