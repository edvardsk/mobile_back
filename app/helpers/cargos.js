// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsRates = SQL_TABLES.EXCHANGE_RATES.COLUMNS;

const calculateCargoPrice = (cargo, rates, userCurrencyId, userCurrencyCode) => {
    let prices = [];

    const originalPriceCurrencyId = cargo[colsCargos.CURRENCY_ID];

    const originalCargoPrice = parseFloat(cargo[colsCargos.PRICE]);
    if (originalPriceCurrencyId === userCurrencyId) {
        prices = rates.map(rate => {
            const value = parseFloat(rate[colsRates.VALUE]);
            const nominal = rate[colsRates.NOMINAL];
            const result = parseFloat((originalCargoPrice / (value / nominal)).toFixed(2));
            return {
                id: rate[colsRates.CURRENCY_ID],
                [HOMELESS_COLUMNS.CURRENCY_CODE]: rate[HOMELESS_COLUMNS.CURRENCY_CODE],
                [colsCargos.PRICE]: result,
                [HOMELESS_COLUMNS.ORIGINAL]: false,
            };
        });
        prices.push({
            id: originalPriceCurrencyId,
            [HOMELESS_COLUMNS.CURRENCY_CODE]: cargo[HOMELESS_COLUMNS.CURRENCY_CODE],
            [colsCargos.PRICE]: originalCargoPrice,
            [HOMELESS_COLUMNS.ORIGINAL]: true,
        });
    } else {
        const rateFromPriceIndex = rates.findIndex(rate => rate[colsRates.CURRENCY_ID] === originalPriceCurrencyId);
        const [rateFromPrice] = rates.splice(rateFromPriceIndex, 1);

        const valueFromPrice = parseFloat(rateFromPrice[colsRates.VALUE]);
        const nominalFromPrice = rateFromPrice[colsRates.NOMINAL];

        const userCurrencyPriceValue = parseFloat((originalCargoPrice / (valueFromPrice / nominalFromPrice)).toFixed(2));

        prices.push({
            id: userCurrencyId,
            [HOMELESS_COLUMNS.CURRENCY_CODE]: userCurrencyCode,
            [colsCargos.PRICE]: userCurrencyPriceValue,
            [HOMELESS_COLUMNS.ORIGINAL]: false,
        });

        prices.push({
            id: originalPriceCurrencyId,
            [HOMELESS_COLUMNS.CURRENCY_CODE]: rateFromPrice[HOMELESS_COLUMNS.CURRENCY_CODE],
            [colsCargos.PRICE]: originalCargoPrice,
            [HOMELESS_COLUMNS.ORIGINAL]: true,
        });

        prices = [
            ...prices,
            ...rates.map(rate => {
                const value = parseFloat(rate[colsRates.VALUE]);
                const nominal = rate[colsRates.NOMINAL];
                const result = parseFloat((userCurrencyPriceValue / (value / nominal)).toFixed(2));
                return {
                    id: rate[colsRates.CURRENCY_ID],
                    [HOMELESS_COLUMNS.CURRENCY_CODE]: rate[HOMELESS_COLUMNS.CURRENCY_CODE],
                    [colsCargos.PRICE]: result,
                    [HOMELESS_COLUMNS.ORIGINAL]: false,
                };
            })
        ];
    }
    return prices;
};

module.exports = {
    calculateCargoPrice,
};
