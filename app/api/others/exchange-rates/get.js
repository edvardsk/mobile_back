const { success } = require('api/response');

// services
const ExchangeRatesService = require('services/tables/exchange-rates');

const getListRates = async (req, res, next) => {
    try {
        const rates = await ExchangeRatesService.getRecords();
        return success(res, { rates });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListRates,
};
