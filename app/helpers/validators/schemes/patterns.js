const DIGITS_VALIDATION_PATTERN = '^\\d+$';
const PASSWORD_VALIDATION_PATTERN = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$';
const URL_VALIDATION_PATTERN = '^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$';
const LETTERS_AND_DIGITS_VALIDATION_PATTERN = '^[a-zA-Z0-9]*$';
// const STATE_REGISTRATION_CERTIFICATE_NUMBER_VALIDATION_PATTERN = '^[A-Z]{2}.[0-9]{2}.[0-9]{2}.[0-9]{2}.[0-9]{3}.[A-Z]{1}.[0-9]{6}.[0-9]{2}.[0-9]{2}$';
const DOUBLE_NUMBER_VALIDATION_PATTERN = '^-?[0-9]+\\.[0-9]+$';
const SIZES_VALIDATION_PATTERN = '^[1-9][0-9]{0,2}(\\.[0-9]{1,2})?$|^0.[0-9]{1,2}$';

const SUPPORTED_MIMTYPES = ['application/pdf', 'image/jpeg'];

const POSTGRES_MAX_STRING_LENGTH = 255;

module.exports = {
    DIGITS_VALIDATION_PATTERN,
    PASSWORD_VALIDATION_PATTERN,
    URL_VALIDATION_PATTERN,
    LETTERS_AND_DIGITS_VALIDATION_PATTERN,
    DOUBLE_NUMBER_VALIDATION_PATTERN,
    SUPPORTED_MIMTYPES,
    POSTGRES_MAX_STRING_LENGTH,
    SIZES_VALIDATION_PATTERN,
};
