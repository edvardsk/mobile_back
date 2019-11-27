const { success } = require('api/response');

// services
const CurrenciesService = require('services/tables/currencies');

const getListCurrencies = async (req, res, next) => {
    try {
        const currencies = await CurrenciesService.getCurrencies();
        return success(res, { currencies });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListCurrencies,
};
