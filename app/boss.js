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
        ]);
        startJobs();
    } catch (error) {
        onError(error);
    }
}

function startJobs() {
    if (process.env.NODE_ENV !== 'development') {
        checkExchangeRatesStart();
    }
}

function onError(error) {
    logger.error(error);
}

async function extractExchangeRate(data) {
    try {
        const jobId = await boss.publish(
            ACTION_TYPES.EXTRACT_CHANGE_RATE,
            data,
            {
                expireIn: '6 hours',
                retryDelay: RETRY_DELAY_SECONDS_JOB,
                retryLimit: INTEGER_MAX_POSTGRES,
            }
        );
        logger.info(`Job created id: ${jobId}`);

    } catch(err) {
        onError(err);
    }
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

async function checkExchangeRatesStart() {
    const colsRates = SQL_TABLES.EXCHANGE_RATES.COLUMNS;
    try {
        const countries = await CountriesService.getCountriesWithCurrencies();
        const rates = await ExchangeRatesService.getRecordsByCountriesIds(countries.map(country => country.id));

        const countriesToUpdateCurrency = countries.filter(country => !rates.find(rate => rate[colsRates.COUNTRY_ID] = country.id));
        if (countriesToUpdateCurrency.length) {
            await Promise.all(countriesToUpdateCurrency.map(country => {
                return extractExchangeRate({ countryId: country.id });
            }));
        }
    } catch (err) {
        logger.info('Check exchange rates failed');
        onError(err);
    }
}
