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
const CurrenciesService = require('services/tables/currencies');
const EconomicSettingsService = require('services/tables/economic-settings');
const LanguagesService = require('services/tables/languages');
const CarsService = require('services/tables/cars');
const TrailersService = require('services/tables/trailers');
const DriversService = require('services/tables/drivers');
const TNVEDCodesService = require('services/tables/tnved-codes');
const DealsService = require('services/tables/deals');

// constants
const { ERRORS } = require('constants/errors');
const { HOMELESS_COLUMNS, SQL_TABLES } = require('constants/tables');

// helpers
const {
    parseStringToJson,
    parseStringToFloat,
    parseStringToInt,
    parseStringBooleanToBoolean,
    parsePaginationOptions,
    compareYears,
    validateDownloadingDateMinimum,
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

ajv.addKeyword('tnved_code_not_exist', {
    async: true,
    type: 'string',
    validate: TNVEDCodesService.checkRecordExists,
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

ajv.addKeyword('free_cargo_not_exist', {
    async: true,
    type: 'string',
    validate: CargosService.checkFreeCargoExists,
});

ajv.addKeyword('cargo_not_exist', {
    async: true,
    type: 'string',
    validate: CargosService.checkCargoExists,
});

ajv.addKeyword('currency_not_exist', {
    async: true,
    type: 'string',
    validate: CurrenciesService.checkRecordExists,
});

ajv.addKeyword('currency_in_prices_not_exist', {
    async: true,
    type: 'array',
    validate: CurrenciesService.checkRecordsExists,
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

ajv.addKeyword('car_state_number_exists', {
    async: true,
    type: 'string',
    validate: CarsService.checkCarStateNumberExistsOpposite,
});

ajv.addKeyword('trailer_state_number_exists', {
    async: true,
    type: 'string',
    validate: TrailersService.checkTrailerStateNumberExistsOpposite,
});

ajv.addKeyword('car_in_company_not_exists', {
    async: true,
    type: 'string',
    validate: CarsService.checkCarInCompanyExist,
});

ajv.addKeyword('car_not_exists', {
    async: true,
    type: 'string',
    validate: CarsService.checkCarExist,
});

ajv.addKeyword('trailer_in_company_not_exists', {
    async: true,
    type: 'string',
    validate: TrailersService.checkTrailerInCompanyExists,
});

ajv.addKeyword('trailer_in_company_without_car_not_exists', {
    async: true,
    type: 'string',
    validate: TrailersService.checkTrailerWithoutCarInCompanyExists,
});

ajv.addKeyword('trailer_in_company_with_car_not_exists', {
    async: true,
    type: 'string',
    validate: TrailersService.checkTrailerWithCarInCompanyExists,
});

ajv.addKeyword('trailer_not_exists', {
    async: true,
    type: 'string',
    validate: TrailersService.checkTrailerExists,
});

ajv.addKeyword('driver_not_exists', {
    async: true,
    type: 'string',
    validate: DriversService.checkDriverExists,
});

ajv.addKeyword('car_danger_class_without_file_or_extra_file', {
    async: true,
    type: 'string',
    validate: CarsService.checkIsPassedFileWithDangerClass,
});

ajv.addKeyword('trailer_danger_class_without_file_or_extra_file', {
    async: true,
    type: 'string',
    validate: TrailersService.checkIsPassedFileWithDangerClass,
});

ajv.addKeyword('new_car_danger_class_without_or_extra_file', {
    async: true,
    type: 'string',
    validate: CarsService.checkIsPassedFileWithNewDangerClass,
});

ajv.addKeyword('new_trailer_danger_class_without_or_extra_file', {
    async: true,
    type: 'string',
    validate: TrailersService.checkIsPassedFileWithNewDangerClass,
});

ajv.addKeyword('required_existing_car_in_company_without_trailer', {
    async: true,
    type: 'string',
    validate: CarsService.checkIsCarInCompanyWithoutTrailerExists,
});

ajv.addKeyword('optional_driver_in_company_not_exists', {
    async: true,
    type: 'string',
    validate: DriversService.checkIsOptionalDriverInCompanyExists,
});

ajv.addKeyword('parse_string_to_json', {
    modifying: true,
    schema: false,
    validate: parseStringToJson,
});

ajv.addKeyword('parse_string_boolean', {
    modifying: true,
    schema: false,
    validate: parseStringBooleanToBoolean,
});

ajv.addKeyword('parse_string_to_float', {
    modifying: true,
    schema: false,
    validate: parseStringToFloat,
});

ajv.addKeyword('parse_string_to_int', {
    modifying: true,
    schema: false,
    validate: parseStringToInt,
});

ajv.addKeyword('parse_pagination_options', {
    modifying: true,
    schema: false,
    validate: parsePaginationOptions,
});

ajv.addKeyword('downloading_date_to_minimum', {
    type: 'string',
    validate: validateDownloadingDateMinimum,
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
        return splitArray.length < 2 || splitArray.pop().length < 3; // todo: check condition
    },
    compare: compareYears, // todo: check
});

ajv.addFormat('price', {
    type: 'number',
    validate: (number) => {
        const str = number.toString();
        const splitArray = str.split('.');
        if (splitArray.length === 1 && splitArray[0].toString().length < 14) {
            return true;
        } else if (splitArray.length === 2) {
            const int = splitArray.shift();
            const fraction = splitArray.shift();
            return int.toString().length < 14 && fraction.toString().length < 3;
        } else {
            return false;
        }
    },
});

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


ajv.addKeyword('deal_in_transporter_company_not_exists', {
    async: true,
    type: 'string',
    validate: DealsService.checkDealInTransporterCompanyExist,
});

ajv.addKeyword('deal_in_company_not_exists', {
    async: true,
    type: 'string',
    validate: DealsService.checkDealInCompanyExist,
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
