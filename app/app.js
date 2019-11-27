const express = require('express');
const path = require('path');
const Debug = require('debug');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const api = require('api');
const { reject } = require('./api/response');
const { ERROR_CODES, SERVER_ERROR_CODES } = require('./constants/http-codes');
const { API_PREFIX } = require('constants/routes');
require('./fork');
require('./cron');

const app = express();
const debug = Debug('config-setup-backend:log');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.raw({
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    limit: '2mb',
}));

app.use(cookieParser());

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
