const Ajv = require('ajv');
const { get } = require('lodash');
const { reject } = require('api/response');
const ajv = new Ajv({ allErrors: true });
require('ajv-keywords')(ajv, 'instanceof');
const fileType = require('file-type');

// services
const UsersService = require('services/tables/users');
const PhonePrefixesService = require('services/tables/phone-prefixes');
const PhoneNumbersService = require('services/tables/phone-numbers');
const CountriesService = require('services/tables/countries');
const CompaniesService = require('services/tables/companies');
const RolesService = require('services/tables/roles');

// constants
const { ERRORS } = require('constants/errors');

ajv.addKeyword('phonePrefixExists', {
    async: true,
    type: 'string',
    validate: PhonePrefixesService.checkPhonePrefixExists,
});

ajv.addKeyword('phoneNumberExists', {
    async: true,
    type: 'string',
    validate: PhoneNumbersService.checkPhoneNumberExists,
});

ajv.addKeyword('countryExists', {
    async: true,
    type: 'string',
    validate: CountriesService.checkCountryExists,
});

ajv.addKeyword('companyWithSettlementAccountExists', {
    async: true,
    type: 'string',
    validate: CompaniesService.checkCompanyWithSettlementAccountExists,
});

ajv.addKeyword('roleExists', {
    async: true,
    type: 'string',
    validate: RolesService.checkRoleExists,
});

ajv.addKeyword('phoneNumberValid', {
    async: true,
    type: 'string',
    validate: PhoneNumbersService.checkPhoneNumberValid,
});

ajv.addKeyword('companyWithIdentityNumberExists', {
    async: true,
    type: 'string',
    validate: CompaniesService.checkCompanyWithIdentityNumberExists,
});

ajv.addKeyword('stateRegistrationCertificateNumberExists', {
    async: true,
    type: 'string',
    validate: CompaniesService.checkCompanyWithStateRegistrationCertificateNumberExists,
});

ajv.addKeyword('passportNumberExists', {
    async: true,
    type: 'string',
    validate: UsersService.checkUserWithPassportNumberExists,
});

const validate = (schemeOrGetter, pathToData = 'body') => async (req, res, next) => {
    try {
        const data = get(req, pathToData);
        let scheme;
        if (typeof schemeOrGetter === 'function') {
            const params = {
                role: res.locals.user.role,
                userId: res.locals.user.id,
            };
            scheme = schemeOrGetter(params);
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

const validateMultipartJSONProp = (scheme, path) => async (req, res, next) => {
    try {
        const data = get(req, path);
        if (data) {
            const prop = JSON.parse(data);
            const validate = ajv.compile(scheme);
            const isValidData = validate(prop);

            if (!isValidData) {
                return reject(res, ERRORS.VALIDATION.ERROR, validate.errors);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

const validateFileType = expectedFileTypes => async (req, res, next) => {
    try {
        const { body } = req;
        if (!Buffer.isBuffer(body)) {
            return reject(res, ERRORS.VALIDATION.FILE_ERROR, { expectedFileTypes });
        }
        const detectedFileType = fileType(body);
        if (!expectedFileTypes.includes(get(detectedFileType, 'ext'))) {
            return reject(res, ERRORS.VALIDATION.FILE_ERROR, { expectedFileTypes });
        }


        // const data = get(req, path);
        // if (data) {
        //     const prop = JSON.parse(data);
        //     const validate = ajv.compile(scheme);
        //     const isValidData = validate(prop);
        //
        //     if (!isValidData) {
        //         return reject(res, ERRORS.VALIDATION.ERROR, validate.errors);
        //     }
        // }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validate,
    validateMultipartJSONProp,
    validateFileType,
};
