// services
const CountriesService = require('./tables/countries');
const BackgroundService = require('./background/creators');

const updateExchangeRates = async () => {
    const countries = await CountriesService.getCountries();
    return Promise.all(countries.map(country => BackgroundService.extractExchangeRateCreator(country.id)));
};

module.exports = {
    updateExchangeRates,
};
