const express = require('express');
const path = require('path');
const Debug = require('debug');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const i18n = require('i18n');

const api = require('api');
const { reject } = require('./api/response');
const { ERROR_CODES, SERVER_ERROR_CODES } = require('./constants/http-codes');
const { API_PREFIX } = require('constants/routes');

const app = express();
const debug = Debug('config-setup-backend:log');

i18n.configure({
    locales:['en', 'rus'],
    directory: `${__dirname}/locales`,
    defaultLocale: 'en',
    cookie: 'i18n'
});

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(cookieParser());
app.use(i18n.init);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    return res.send('Hello');
});

app.use(API_PREFIX, api);

app.use((req, res) => {
    return reject(res, '', {}, ERROR_CODES.NOT_FOUND);
});

// error handler
// eslint-disable-next-line
app.use((error, req, res, next) => {
    global.logger.error(error);
    return reject(res, '', error, SERVER_ERROR_CODES.INTERNAL_ERROR);
});

// Handle uncaughtException
process.on('uncaughtException', (err) => {
    debug('Caught exception: %j', err);
    process.exit(1);
});

module.exports = app;
