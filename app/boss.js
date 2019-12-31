require('app-module-path').addPath(`${__dirname}`);
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        format.colorize(),
        format.json(),
        myFormat,
    ),
    transports: [new transports.Console()]
});

global.logger = logger;

const PgBoss = require('pg-boss');
const moment = require('moment');

// constants
const { ACTION_TYPES } = require('./constants/background');
const { SQL_TABLES } = require('./constants/tables');

// services
const WorkerServices = require('./services/background/workers');
const CountriesService = require('./services/tables/countries');
const ExchangeRatesService = require('./services/tables/exchange-rates');

const { dbUrl } = require('./db');

const boss = new PgBoss(dbUrl, {
    uuid: 'v4'
});

const PARALLEL_JOBS_NUMBER = +process.env.PARALLEL_JOBS_NUMBER || 5;
const EXPIRE_IN_JOB = process.env.EXPIRE_IN_JOB || '3 days';
const RETRY_DELAY_SECONDS_JOB = +process.env.RETRY_DELAY_SECONDS_JOB || 60; // 1 minute
const INTEGER_MAX_POSTGRES = 2147483647;
const EXTRACT_EXCHANGE_RATE_EXPIRE_IN = '1 day';
const CANCEL_UNCONFIRMED_DEAL_UNIT = process.env.CANCEL_UNCONFIRMED_DEAL_UNIT || 'hours';
const CANCEL_UNCONFIRMED_DEAL_VALUE = +process.env.CANCEL_UNCONFIRMED_DEAL_VALUE || 2;

boss.on('error', onError);
boss.start()
    .then(subscribe)
    .catch(onError);

process.on('message', function (msg) {
    switch(msg.type) {
    case ACTION_TYPES.TRANSLATE_COORDINATES_NAME:
        translateCoordinates(msg.payload);
        break;

    case ACTION_TYPES.EXTRACT_CHANGE_RATE:
        extractExchangeRate(msg.payload);
        break;

    case ACTION_TYPES.AUTO_CANCEL_UNCONFIRMED_DEAL:
        autoCancelUnconfirmedDeal(msg.payload);
        break;

    case ACTION_TYPES.AUTO_SET_GOING_TO_UPLOAD_DEAL_STATUS:
        autoSetGoingToUploadDealStatus(msg.payload);
        break;

    }
});

async function subscribe() {
    try {
        await Promise.all([
            boss.subscribe(ACTION_TYPES.TRANSLATE_COORDINATES_NAME, {
                teamSize: PARALLEL_JOBS_NUMBER,
                teamConcurrency: PARALLEL_JOBS_NUMBER
            }, WorkerServices.translateCoordinates),

            boss.subscribe(ACTION_TYPES.EXTRACT_CHANGE_RATE, {
                teamSize: PARALLEL_JOBS_NUMBER,
                teamConcurrency: PARALLEL_JOBS_NUMBER
            }, WorkerServices.extractExchangeRate),

            boss.subscribe(ACTION_TYPES.AUTO_CANCEL_UNCONFIRMED_DEAL, {
                teamSize: PARALLEL_JOBS_NUMBER,
                teamConcurrency: PARALLEL_JOBS_NUMBER
            }, WorkerServices.autoCancelUnconfirmedDeal),

            boss.subscribe(ACTION_TYPES.AUTO_SET_GOING_TO_UPLOAD_DEAL_STATUS, {
                teamSize: PARALLEL_JOBS_NUMBER,
                teamConcurrency: PARALLEL_JOBS_NUMBER
            }, WorkerServices.autoSetGoingToUploadDealStatus),
        ]);
        startJobs();
    } catch (error) {
        onError(error);
    }
}

function startJobs() {
    checkExchangeRatesStart();
}

function onError(error) {
    logger.error(error);
}

async function translateCoordinates(data) {
    try {
        const jobId = await boss.publish(
            ACTION_TYPES.TRANSLATE_COORDINATES_NAME,
            data,
            {
                expireIn: EXPIRE_IN_JOB,
                retryDelay: RETRY_DELAY_SECONDS_JOB,
                retryLimit: INTEGER_MAX_POSTGRES,
            }
        );
        logger.info(`Job created id: ${jobId}`);

    } catch(err) {
        onError(err);
    }
}

async function extractExchangeRate(data) {
    try {
        const jobId = await boss.publish(
            ACTION_TYPES.EXTRACT_CHANGE_RATE,
            data,
            {
                expireIn: EXTRACT_EXCHANGE_RATE_EXPIRE_IN,
                retryDelay: RETRY_DELAY_SECONDS_JOB,
                retryLimit: 1,
            }
        );
        logger.info(`Job created id: ${jobId}`);

    } catch(err) {
        onError(err);
    }
}

async function autoCancelUnconfirmedDeal(data) {
    try {
        const jobId = await boss.publish(
            ACTION_TYPES.AUTO_CANCEL_UNCONFIRMED_DEAL,
            data,
            {
                startAfter: moment().add(CANCEL_UNCONFIRMED_DEAL_VALUE, CANCEL_UNCONFIRMED_DEAL_UNIT).toISOString(),
            },
        );
        logger.info(`Job created id: ${jobId}`);

    } catch(err) {
        onError(err);
    }
}

async function autoSetGoingToUploadDealStatus(data) {
    try {
        const { timeToExecute } = data;
        delete data['timeToExecute'];

        const jobId = await boss.publish(
            ACTION_TYPES.AUTO_SET_GOING_TO_UPLOAD_DEAL_STATUS,
            data,
            {
                startAfter: timeToExecute || 0,
            },
        );
        logger.info(`Job created id: ${jobId}`);

    } catch(err) {
        onError(err);
    }
}

async function checkExchangeRatesStart() {
    const colsRates = SQL_TABLES.EXCHANGE_RATES.COLUMNS;
    try {
        const countries = await CountriesService.getCountriesWithCurrencies();
        const rates = await ExchangeRatesService.getRecordsByCountriesIds(countries.map(country => country.id));

        const countriesToUpdateCurrency = countries.filter(country => {
            const rate = rates.find(rate => rate[colsRates.COUNTRY_ID] === country.id);
            const startDayToday = moment().startOf('day');
            return !rate || moment(rate[colsRates.ACTUAL_DATE]) < startDayToday;
        });
        if (countriesToUpdateCurrency.length) {
            const today = moment().format('YYYY-MM-DD');
            await Promise.all(countriesToUpdateCurrency.map(country => {
                return extractExchangeRate({ countryId: country.id, extractingDate: today });
            }));
        }
    } catch (err) {
        logger.info('Check exchange rates failed');
        onError(err);
    }
}
