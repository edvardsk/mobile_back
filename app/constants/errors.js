const ERRORS = {
    USERS: {
        INVALID_EMAIL: 'users.invalid_name',
    },
    REGISTRATION: {
        DUPLICATE_USER: 'registration.duplicate_user',
    },
    AUTHORIZATION: {
        INVALID_NAME_OR_PASSWORD: 'authorization.invalid_name_or_password',
        INVALID_DATA: 'authorization.invalid_data',
    },
    AUTHENTICATION: {
        INVALID_TOKEN: 'authentication.invalid_token',
        EXPIRED_TOKEN: 'authentication.expired_token',
    },
};

// class PaginationError extends Error {
//     constructor(...props) {
//         super(...props);
//         Error.captureStackTrace(this, PaginationError);
//     }
// }
//
// class FiltrationError extends Error {
//     constructor(...props) {
//         super(...props);
//         Error.captureStackTrace(this, FiltrationError);
//     }
// }

module.exports = {
    ERRORS,
    // PaginationError,
    // FiltrationError,
};
