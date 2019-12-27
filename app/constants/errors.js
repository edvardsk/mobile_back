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
        EXPIRED_HASH: 'authorization.expired_hash',
        INVALID_EMAIL_FORMAT: 'authorization.invalid_email_format',
        INVALID_PASSWORD_FORMAT: 'authorization.invalid_password_format',
        USER_CONFIRMED_EMAIL: 'authorization.user_confirmed_email',
        FREEZED: 'authorization.freezed',
    },
    AUTHENTICATION: {
        INVALID_TOKEN: 'authentication.invalid_token',
        EXPIRED_TOKEN: 'authentication.expired_token',
        FREEZED: 'authentication.freezed',
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
        TOO_MUCH_FILES: 'files.too_much_files',
    },
    COMPANIES: {
        INVALID_COMPANY_ID: 'companies.invalid_company_id',
        NOT_USER_IN_COMPANY: 'companies.not_user_in_company',
        APPROVED: 'companies.approved',
    },
    VALIDATION: {
        ERROR: 'validation.error',
        INVALID_PHONE_NUMBER: 'validation.invalid_phone_number',
        FILE_ERROR: 'validation.file_error',
    },
    PHONE_CONFIRMATION: {
        TOO_OFTEN: 'phone_confirmation.too_often',
        INVALID_CODE: 'phone_confirmation.invalid_code',
        SEND_CODE_FIRST: 'phone_confirmation.send_code_first',
        CODE_HAS_EXPIRED: 'phone_confirmation.code_has_expired',
    },
    INVITES: {
        HASH_USED: 'invites.hash_used',
        HASH_EXPIRED: 'invites.hash_expired',
        ALREADY_CONFIRMED: 'invites.already_confirmed',
        TOO_OFTEN: 'invites.too_often',
        PROHIBITED: 'invites.prohibited',
        SKIPPED_DATES: 'invites.skipped_dates',
        SKIPPED_REQUIRED_FILES: 'invites.skipped_required_files',
    },
    ACCOUNT_CONFIRMATIONS: {
        PROHIBITED: 'account_confirmations.prohibited',
    },
    FREEZING: {
        FREEZED: 'freezing.freezed',
        NOT_FREEZED: 'freezing.not_freezed',
        NOT_ENOUGH_POWER: 'freezing.not_enough_power',
    },
    CARGOS: {
        UNABLE_TO_CREATE: 'cargos.unable_to_create',
        UNABLE_TO_EDIT: 'cargos.unable_to_edit',
        UNABLE_TO_DELETE: 'cargos.unable_to_delete',
    },
    ECONOMIC_SETTINGS: {
        SUM_PERCENT_TRANSPORTER_HOLDER_ERROR: 'economic_settings.sum_percent_transporter_holder_error',
    },
    DEALS: {
        CARGO_NOT_EXISTS: 'deals.cargo_not_exists',
        INVALID_CARGO_COUNT: 'deals.invalid_cargo_count',
        NO_ONE_OR_MANY_CARGOS: 'deals.no_one_or_many_cargos',
        INVALID_CURRENCY: 'deals.invalid_currency',
        INVALID_DRIVER_ID: 'deals.invalid_driver_id',
        INVALID_CAR_ID: 'deals.invalid_car_id',
        INVALID_TRAILER_ID: 'deals.invalid_trailer_id',
        DIFFERENT_CARGO_LOADING_METHOD: 'deals.different_cargo_loading_method',
        DUPLICATE_DATA: 'deals.duplicate_data',
        DUPLICATE_PHONE_NUMBERS: 'deals.duplicate_phone_numbers',
        CAR_STATE_NUMBER_EXISTS: 'deals.car_state_number_exists',
        TRAILER_STATE_NUMBER_EXISTS: 'deals.trailer_state_number_exists',
        INVALID_CAR_WITH_TRAILER_JOIN: 'deals.invalid_car_with_trailer_join',
        INVALID_UPLOADING_POINTS_INFO: 'deals.invalid_uploading_points_info',
        INVALID_DOWNLOADING_POINTS_INFO: 'deals.invalid_downloading_points_info',
        STEP_ALREADY_CONFIRMED_BY_THIS_ROLE: 'deals.step_already_confirmed_by_this_role',
        INSTANCES_ERROR: 'deals.instances_error',
        SHADOW_CAR: 'deals.shadow_car',
        NOT_VERIFIED_CAR: 'deals.not_verified_car',
        CAR_IN_DRAFT: 'deals.car_in_draft',
        SHADOW_TRAILER: 'deals.shadow_trailer',
        NOT_VERIFIED_TRAILER: 'deals.not_verified_trailer',
        TRAILER_IN_DRAFT: 'deals.trailer_in_draft',
        SHADOW_DRIVER: 'deals.shadow_driver',
        NOT_VERIFIED_DRIVER: 'deals.not_verified_driver',
        DRIVER_IN_DRAFT: 'deals.driver_in_draft',
    },
    VERIFY: {
        ALREADY_VERIFIED: 'verify.already_verified',
    },
    REJECT: {
        NOTHING_TO_REJECT: 'reject.nothing_to_reject',
    },
    PHONE_NUMBERS: {
        BUSY: 'phone_numbers.busy',
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
