const querystring = require('querystring');

const {
    CLIENT_APP_URL,
    CLIENT_ROUTE_TO_CONFIRM_PASSWORD,
    CLIENT_ROUTE_TO_REST_PASSWORD
} = process.env;

const formatConfirmationEmailUrl = (hash) => (
    `${CLIENT_APP_URL}${CLIENT_ROUTE_TO_CONFIRM_PASSWORD}?${querystring.stringify({ hash })}`
);

const formatResetPasswordUrl = hash => (
    `${CLIENT_APP_URL}${CLIENT_ROUTE_TO_REST_PASSWORD}?${querystring.stringify({ hash })}`
);

module.exports = {
    formatConfirmationEmailUrl,
    formatResetPasswordUrl,
};
