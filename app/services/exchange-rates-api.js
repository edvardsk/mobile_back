const rp = require('request-promise');

const xml2js = require('xml2js');
const moment = require('moment');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');
const { CURRENCIES_MAP } = require('constants/currencies');

const BELARUS_URL = 'http://www.nbrb.by/api/exrates/rates?periodicity=0';
const RUSSIA_URL = 'http://www.cbr.ru/scripts/XML_daily.asp';
const UKRAINE_URL = 'https://old.bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';

const extractBelarusRates = async (currenciesMap, extractingDate) => {
    const today = moment(extractingDate).format('YYYY-MM-DD');
    const bodyString = await rp(`${BELARUS_URL}&onDate=${today}`);
    const body = JSON.parse(bodyString);
    const filteredDownloadedCurrencies = body.filter(
        currency => currenciesMap.has(currency['Cur_Abbreviation'].toLowerCase())
    );
    return filteredDownloadedCurrencies.map(currency => ({
        [HOMELESS_COLUMNS.CURRENCY_CODE]: currency['Cur_Abbreviation'].toLowerCase(),
        [HOMELESS_COLUMNS.CURRENCY_SCALE]: currency['Cur_Scale'],
        [HOMELESS_COLUMNS.CURRENCY_RATE]: currency['Cur_OfficialRate'],
    }));
};

const extractRussiaRates = async (currenciesMap, extractingDate) => {
    const today = moment(extractingDate).format('DD/MM/YYYY');
    const bodyString = await rp({
        uri: `${RUSSIA_URL}?date_req=${today}`,
        headers: {
            'User-Agent': 'curl/7.47.0',
        },
    });
    const parser = new xml2js.Parser();
    const parsedData = await parser.parseStringPromise(bodyString);

    const res = parsedData.ValCurs.Valute;
    const filteredDownloadedCurrencies = res.filter(
        currency => currenciesMap.has(currency['CharCode'][0].toLowerCase())
    );
    return filteredDownloadedCurrencies.map(currency => ({
        [HOMELESS_COLUMNS.CURRENCY_CODE]: currency['CharCode'].pop().toLowerCase(),
        [HOMELESS_COLUMNS.CURRENCY_SCALE]: parseInt(currency['Nominal'].pop()),
        [HOMELESS_COLUMNS.CURRENCY_RATE]: parseFloat(currency['Value'].pop().replace(',', '.')),
    }));
};

const extractUkraineRates = async (currenciesMap, extractingDate) => {
    const today = moment(extractingDate).format('DD/MM/YYYY');
    const bodyString = await rp(`${UKRAINE_URL}?date=${today}`);
    const body = JSON.parse(bodyString);
    const filteredDownloadedCurrencies = body.filter(
        currency => currenciesMap.has(currency['cc'].toLowerCase())
    );
    const formattedCurrencies = filteredDownloadedCurrencies.map(currency => {
        const rate = currency['rate'];
        return {
            [HOMELESS_COLUMNS.CURRENCY_CODE]: currency['cc'].toLowerCase(),
            [HOMELESS_COLUMNS.CURRENCY_RATE]: rate,
        };
    });
    const indexEuro = formattedCurrencies.findIndex(currency => currency[HOMELESS_COLUMNS.CURRENCY_CODE] === CURRENCIES_MAP.EUR);
    const [euro] = formattedCurrencies.splice(indexEuro, 1);

    const euroValue = euro[HOMELESS_COLUMNS.CURRENCY_RATE];
    return formattedCurrencies.map(currency => {
        const rate = currency[HOMELESS_COLUMNS.CURRENCY_RATE];
        const calculatedValue = euroValue / rate;
        const roundedValue = parseFloat(calculatedValue.toFixed(4));
        const [value, scale] = formatRoundedValue(roundedValue);
        return {
            [HOMELESS_COLUMNS.CURRENCY_CODE]: currency[HOMELESS_COLUMNS.CURRENCY_CODE],
            [HOMELESS_COLUMNS.CURRENCY_SCALE]: scale,
            [HOMELESS_COLUMNS.CURRENCY_RATE]: value,
        };
    });
};

const formatRoundedValue = rate => {
    const scaleLength = rate.toString().split('.').pop().length;
    if (scaleLength === 0) {
        return [rate, 1];
    } else {
        const newRate = Math.round(rate * 10**scaleLength);
        const scale = 10 ** scaleLength;
        return [newRate, scale];
    }
};

module.exports = {
    extractBelarusRates,
    extractRussiaRates,
    extractUkraineRates,
};
