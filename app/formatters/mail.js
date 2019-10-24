const querystring = require('querystring');

const {
    CLIENT_APP_URL,
    CLIENT_ROUTE_TO_CONFIRM_EMAIL,
    CLIENT_ROUTE_TO_REST_PASSWORD
} = process.env;

const formatConfirmationEmailUrl = (hash, role) => (
    `${CLIENT_APP_URL}${CLIENT_ROUTE_TO_CONFIRM_EMAIL}?${querystring.stringify({ hash, role })}`
);

const formatResetPasswordUrl = hash => (
    `${CLIENT_APP_URL}${CLIENT_ROUTE_TO_REST_PASSWORD}?${querystring.stringify({ hash })}`
);

module.exports = {
    formatConfirmationEmailUrl,
    formatResetPasswordUrl,
};
