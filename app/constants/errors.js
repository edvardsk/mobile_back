const ERRORS = {
    USERS: {
        INVALID_EMAIL: 'users.invalid_email',
    },
    REGISTRATION: {
        INVALID_USER_DATA: 'registration.invalid_user_data',
        DUPLICATE_USER: 'registration.duplicate_user',
        INVALID_ROLE_ID: 'registration.invalid_role_id',
    },
    AUTHORIZATION: {
        INVALID_EMAIL_OR_PASSWORD: 'authorization.invalid_email_or_password',
        UNCONFIRMED_EMAIL: 'authorization.unconfirmed_email',
        INVALID_HASH: 'authorization.invalid_hash',
        INVALID_EMAIL_FORMAT: 'authorization.invalid_email_format',
        INVALID_PASSWORD_FORMAT: 'authorization.invalid_password_format',
        USER_CONFIRMED_EMAIL: 'authorization.user_confirmed_email',
    },
    AUTHENTICATION: {
        INVALID_TOKEN: 'authentication.invalid_token',
        EXPIRED_TOKEN: 'authentication.expired_token',
    },
    SYSTEM: {
        ERROR: 'system.error',
        PAGINATION_PAGE_ERROR: 'system.pagination_page_error',
        PAGINATION_LIMIT_ERROR: 'system.pagination_limit_error',
        SORTING_COLUMNS_ERROR: 'system.sorting_column_error',
        SORTING_DIRECTION_ERROR: 'system.sorting_column_error',
        FILTRATION_ERROR: 'system.filtration_error',
        FORBIDDEN: 'system.forbidden',
    },
    FILES: {
        UPLOADING_ERROR: 'files.uploading_error',
    },
    COMPANY: {
        VALIDATION_ERROR: 'company.validation_error',
    },
    VALIDATION: {
        ERROR: 'validation.error',
        INVALID_PHONE_NUMBER: 'validation.invalid_phone_number',
    },
    PHONE_CONFIRMATION: {
        TOO_OFTEN: 'phone_confirmation.too_often',
        INVALID_CODE: 'phone_confirmation.invalid_code',
        SEND_CODE_FIRST: 'phone_confirmation.send_code_first',
        CODE_HAS_EXPIRED: 'phone_confirmation.code_has_expired',
    },
};

class PaginationError extends Error {
    constructor(...props) {
        super(...props);
        Error.captureStackTrace(this, PaginationError);
    }
}

class FiltrationError extends Error {
    constructor(...props) {
        super(...props);
        Error.captureStackTrace(this, FiltrationError);
    }
}

module.exports = {
    ERRORS,
    PaginationError,
    FiltrationError,
};
