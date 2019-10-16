const  { oneOrNone } = require('db');

// sql-helpers
const {
    selectCountryById,
} = require('sql-helpers/countries');

// helpers
const { isValidUUID } = require('helpers/validators');

const getCountry = id => oneOrNone(selectCountryById(id));

const checkCountryExists = async (schema, id) => {
    if (!isValidUUID(id)) {
        return false;
    }
    const country = await getCountry(id);
    return !!country;
};

module.exports = {
    getCountry,
    checkCountryExists,
};
