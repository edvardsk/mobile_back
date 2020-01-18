const { createLogger, format, transports } = require('winston');
const moment = require('moment');

const { combine, timestamp, printf } = format;
const DATE_FORMAT = '';

const myFormat = printf(({ level, message, timestamp, stack }) => {
    return `${moment(timestamp).format(DATE_FORMAT)} ${level}: ${stack || message}`;
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
