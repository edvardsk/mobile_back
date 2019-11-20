const Ajv = require('ajv');
const { get } = require('lodash');
const { reject } = require('api/response');
const ajv = new Ajv({ allErrors: true, jsonPointers: true, $data: true });
require('ajv-keywords')(ajv);
require('ajv-errors')(ajv);
const fileType = require('file-type');

// services
const UsersService = require('services/tables/users');
const PhonePrefixesService = require('services/tables/phone-prefixes');
const PhoneNumbersService = require('services/tables/phone-numbers');
const CountriesService = require('services/tables/countries');
const CompaniesService = require('services/tables/companies');
const RolesService = require('services/tables/roles');
const DangerClassesService = require('services/tables/danger-classes');
const VehicleClassesService = require('services/tables/vehicle-types');
const CargosService = require('services/tables/cargos');
const EconomicSettingsService = require('services/tables/economic-settings');
const LanguagesService = require('services/tables/languages');

// constants
const { ERRORS } = require('constants/errors');
const { HOMELESS_COLUMNS, SQL_TABLES } = require('constants/tables');

// helpers
const {
    parseStringToJson,
    parseStringToFloat,
    parsePaginationOptions,
    compareYears,
} = require('helpers/validators/custom');

const yearRegex = /^[0-9]{1,4}$/;

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

ajv.addKeyword('language_not_exist', {
    async: true,
    type: 'string',
    validate: LanguagesService.checkLanguageExists,
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

ajv.addKeyword('danger_class_not_exist', {
    async: true,
    type: 'string',
    validate: DangerClassesService.checkRecordExists,
});

ajv.addKeyword('vehicle_type_not_exist', {
    async: true,
    type: 'string',
    validate: VehicleClassesService.checkRecordExists,
});

ajv.addKeyword('cargo_in_company_not_exist', {
    async: true,
    type: 'string',
    validate: CargosService.checkCargoInCompanyExists,
});

ajv.addKeyword('company_economic_settings_exists', {
    async: true,
    type: 'string',
    validate: EconomicSettingsService.checkEconomicSettingsExistsOpposite,
});

ajv.addKeyword('company_economic_settings_not_exists', {
    async: true,
    type: 'string',
    validate: EconomicSettingsService.checkEconomicSettingsExists,
});

ajv.addKeyword('parse_string_to_json', {
    modifying: true,
    schema: false,
    validate: parseStringToJson,
});

ajv.addKeyword('parse_string_to_float', {
    modifying: true,
    schema: false,
    validate: parseStringToFloat,
});

ajv.addKeyword('parse_pagination_options', {
    modifying: true,
    schema: false,
    validate: parsePaginationOptions,
});

ajv.addFormat('year', {
    validate: (yearString) => yearRegex.test(yearString),
    compare: compareYears,
});

ajv.addFormat('size', {
    type: 'number',
    validate: (number) => {
        const str = number.toString();
        const splitArray = str.split('.');
        return splitArray.length < 2 || splitArray.pop().length < 3;
    },
    compare: compareYears,
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
                role: res.locals.user.role,
                userId: res.locals.user.id,
                isControlRole: res.locals.isControlRole,
                shadowUserId: res.locals.shadowUserId,
                companyHeadRole: get(res, `locals.company.${HOMELESS_COLUMNS.HEAD_ROLE_NAME}`),
                requestParams: req.params,
                targetRole: res.locals.targetRole,
                company: res.locals.company,
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

const validateEconomicPercentsSum = async (req, res, next) => {
    const colsEconomicSettings = SQL_TABLES.ECONOMIC_SETTINGS.COLUMNS;
    try {
        const { body } = req;
        const transporterPercent = body[colsEconomicSettings.PERCENT_FROM_TRANSPORTER];
        const holderPercent = body[colsEconomicSettings.PERCENT_FROM_HOLDER];
        if (transporterPercent + holderPercent >= 100) {
            return reject(res, ERRORS.ECONOMIC_SETTINGS.SUM_PERCENT_TRANSPORTER_HOLDER_ERROR);
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validate,
    validateFileType,
    validateEconomicPercentsSum,
};
