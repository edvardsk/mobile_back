const  { oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectCountryById,
    selectCountries,
} = require('sql-helpers/countries');

const getCountry = id => oneOrNone(selectCountryById(id));

const getCountries = () => manyOrNone(selectCountries());

const checkCountryExists = async (schema, id) => {
    const country = await getCountry(id);
    return !!country;
};

module.exports = {
    getCountry,
    getCountries,
    checkCountryExists,
};
