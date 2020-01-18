const moment = require('moment');

// services
const CountriesService = require('./tables/countries');
const BackgroundService = require('./background/creators');

const updateExchangeRates = async () => {
    const today = moment().format('YYYY-MM-DD');
    const countries = await CountriesService.getCountries();
    return Promise.all(countries.map(country => BackgroundService.extractExchangeRateCreator(country.id, today)));
};

module.exports = {
    updateExchangeRates,
};
