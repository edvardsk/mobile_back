const rp = require('request-promise');
const xml2js = require('xml2js');
const moment = require('moment');

// constants
const { HOMELESS_COLUMNS } = require('constants/tables');

const BELARUS_URL = 'http://www.nbrb.by/api/exrates/rates?periodicity=0';
const RUSSIA_URL = 'http://www.cbr.ru/scripts/XML_daily.asp';

const extractBelarusRates = async () => {
    const today = moment().format('YYYY-MM-DD');
    const bodyString = await rp(`${BELARUS_URL}&onDate=${today}`);
    const body = JSON.parse(bodyString);
    return body.map(currency => ({
        [HOMELESS_COLUMNS.CURRENCY_CODE]: currency['Cur_Abbreviation'].toLowerCase(),
        [HOMELESS_COLUMNS.CURRENCY_SCALE]: currency['Cur_Scale'],
        [HOMELESS_COLUMNS.CURRENCY_RATE]: currency['Cur_OfficialRate'],
    }));
};

const extractRussiaRates = async () => {
    const today = moment().format('DD/MM/YYYY');
    const bodyString = await rp(`${RUSSIA_URL}?date_req=${today}`);
    const parser = new xml2js.Parser();
    const parsedData = await parser.parseStringPromise(bodyString);

    const res = parsedData.ValCurs.Valute;
    return res.map(currency => ({
        [HOMELESS_COLUMNS.CURRENCY_CODE]: currency['CharCode'].pop().toLowerCase(),
        [HOMELESS_COLUMNS.CURRENCY_SCALE]: parseInt(currency['Nominal'].pop()),
        [HOMELESS_COLUMNS.CURRENCY_RATE]: parseFloat(currency['Value'].pop().replace(',', '.')),
    }));
};

module.exports = {
    extractBelarusRates,
    extractRussiaRates,
};
