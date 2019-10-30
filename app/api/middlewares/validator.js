const Ajv = require('ajv');
const { get } = require('lodash');
const { reject } = require('api/response');
const ajv = new Ajv({ allErrors: true });
require('ajv-keywords')(ajv, 'instanceof');
require('ajv-errors')(ajv);
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

// helpers
const { parseStringToJson, parsePaginationOptions } = require('helpers/validators/custom');

ajv.addKeyword('phone_prefix_not_exist', {
    async: true,
    type: 'string',
    validate: PhonePrefixesService.checkPhonePrefixExistsOpposite,
});

ajv.addKeyword('phone_number_exists', {
    async: true,
    type: 'string',
    validate: PhoneNumbersService.checkPhoneNumberExists,
});

ajv.addKeyword('country_not_exist', {
    async: true,
    type: 'string',
    validate: CountriesService.checkCountryExists,
});

ajv.addKeyword('company_with_settlement_account_exists', {
    async: true,
    type: 'string',
    validate: CompaniesService.checkCompanyWithSettlementAccountExistsOpposite,
});

ajv.addKeyword('role_not_exist', {
    async: true,
    type: 'string',
    validate: RolesService.checkRoleExistsOpposite,
});

ajv.addKeyword('phone_number_not_valid', {
    async: true,
    type: 'string',
    validate: PhoneNumbersService.checkPhoneNumberValid,
});

ajv.addKeyword('company_with_identity_number_exists', {
    async: true,
    type: 'string',
    validate: CompaniesService.checkCompanyWithIdentityNumberExistsOpposite,
});

ajv.addKeyword('company_with_name_exists', {
    async: true,
    type: 'string',
    validate: CompaniesService.checkCompanyWithNameExistsOpposite,
});

ajv.addKeyword('state_registration_certificate_number_exists', {
    async: true,
    type: 'string',
    validate: CompaniesService.checkCompanyWithStateRegistrationCertificateNumberExistsOpposite,
});

ajv.addKeyword('passport_number_exists', {
    async: true,
    type: 'string',
    validate: UsersService.checkUserWithPassportNumberExistsOpposite,
});

ajv.addKeyword('email_exists', {
    async: true,
    type: 'string',
    validate: UsersService.checkUserWithEmailExistsOpposite,
});

ajv.addKeyword('email_not_exists', {
    async: true,
    type: 'string',
    validate: UsersService.checkUserWithEmailExists,
});

ajv.addKeyword('parse_string_to_json', {
    modifying: true,
    schema: false,
    validate: parseStringToJson,
});

ajv.addKeyword('parse_pagination_options', {
    modifying: true,
    schema: false,
    validate: parsePaginationOptions,
});

ajv.addKeyword('user_with_id_not_exist', {
    async: true,
    type: 'string',
    validate: UsersService.checkUserWithIdExists,
});

ajv.addKeyword('not_valid_settlement_account', {
    async: true,
    type: 'string',
    validate: CompaniesService.validateSettlementAccount,
});

ajv.addKeyword('company_with_id_not_exist', {
    async: true,
    type: 'string',
    validate: CompaniesService.checkCompanyWithIdExists,
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

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validate,
    validateFileType,
};
