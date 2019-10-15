const {
    PHONE_CONFIRMATION_NEXT_REQUEST_VALUE,
} = process.env;

const nextAllowedRequestForSendingCode = count => +PHONE_CONFIRMATION_NEXT_REQUEST_VALUE * 2 ** (count - 1);

module.exports = {
    nextAllowedRequestForSendingCode,
};
