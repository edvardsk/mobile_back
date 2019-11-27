const  { one, oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectCountryById,
    selectCountries,
    selectCountriesWithCurrencies,
} = require('sql-helpers/countries');

const getCountry = id => oneOrNone(selectCountryById(id));

const getCountryStrict = id => one(selectCountryById(id));

const getCountries = () => manyOrNone(selectCountries());

const getCountriesWithCurrencies = () => manyOrNone(selectCountriesWithCurrencies());

const checkCountryExists = async (schema, id) => {
    const country = await getCountry(id);
    return !!country;
};

module.exports = {
    getCountry,
    getCountryStrict,
    getCountries,
    getCountriesWithCurrencies,

    checkCountryExists,
};
