const  { oneOrNone, manyOrNone } = require('db');

// sql-helpers
const {
    selectCountryById,
    selectCountries,
} = require('sql-helpers/countries');

// helpers
const { isValidUUID } = require('helpers/validators');

const getCountry = id => oneOrNone(selectCountryById(id));

const getCountries = () => manyOrNone(selectCountries());

const checkCountryExists = async (schema, id) => {
    if (!isValidUUID(id)) {
        return false;
    }
    const country = await getCountry(id);
    return !!country;
};

module.exports = {
    getCountry,
    getCountries,
    checkCountryExists,
};
