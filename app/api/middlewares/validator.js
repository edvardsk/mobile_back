const Ajv = require('ajv');
const { get } = require('lodash');
const { reject } = require('api/response');
const ajv = new Ajv({ allErrors: true });
require('ajv-keywords')(ajv, 'instanceof');

// services
const PhonePrefixesService = require('services/tables/phone-prefixes');
const PhoneNumbersService = require('services/tables/phone-numbers');
const CountriesService = require('services/tables/countries');
const CompaniesService = require('services/tables/companies');

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

const validate = (schemeOrGetter, pathToData = 'body') => async (req, res, next) => {
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
