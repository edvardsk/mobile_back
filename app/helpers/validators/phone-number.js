const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

const isValidPhoneNumber = (phoneNumber, prefix) => {
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, prefix);
    return phoneUtil.isValidNumber(number);
};

module.exports = {
    isValidPhoneNumber,
};
