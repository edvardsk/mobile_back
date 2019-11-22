const SQL_TABLES = {
    USERS: {
        NAME: 'users',
        COLUMNS: {
            EMAIL: 'email',
            FULL_NAME: 'full_name',
            PASSWORD: 'password',
            KEY: 'key',
            CREATED_AT: 'created_at',
            PASSPORT_NUMBER: 'passport_number',
            PASSPORT_CREATED_AT: 'passport_created_at',
            PASSPORT_EXPIRED_AT: 'passport_expired_at',
            PASSPORT_ISSUING_AUTHORITY: 'passport_issuing_authority',
            FREEZED: 'freezed',
            LANGUAGE_ID: 'language_id',
        },
    },
    EMAIL_CONFIRMATION_HASHES: {
        NAME: 'email_confirmation_hashes',
        COLUMNS: {
            USER_ID: 'user_id',
            INITIATOR_ID: 'initiator_id',
            HASH: 'hash',
            USED: 'used',
            EXPIRED_AT: 'expired_at',
            CREATED_AT: 'created_at',
        },
    },
    ROLES: {
        NAME: 'roles',
        COLUMNS: {
            NAME: 'name',
            DESCRIPTION: 'description',
            CREATED_AT: 'created_at',
        },
    },
    PERMISSIONS: {
        NAME: 'permissions',
        COLUMNS: {
            NAME: 'name',
            DESCRIPTION: 'description',
            CREATED_AT: 'created_at',
        },
    },
    USERS_TO_ROLES: {
        NAME: 'users_to_roles',
        COLUMNS: {
            USER_ID: 'user_id',
            ROLE_ID: 'role_id',
            CREATED_AT: 'created_at',
        },
    },
    ROLES_TO_PERMISSIONS: {
        NAME: 'roles_to_permissions',
        COLUMNS: {
            ROLE_ID: 'role_id',
            PERMISSION_ID: 'permission_id',
            CREATED_AT: 'created_at',
        },
    },
    FORGOT_PASSWORD: {
        NAME: 'forgot_password',
        COLUMNS: {
            USER_ID: 'user_id',
            HASH: 'hash',
            CREATED_AT: 'created_at',
            EXPIRED_AT: 'expired_at',
        },
    },
    FILES: {
        NAME: 'files',
        COLUMNS: {
            NAME: 'name',
            URL: 'url',
            LABELS: 'labels',
            DESCRIPTION: 'description',
            EXPIRED_AT: 'expired_at',
            CREATED_AT: 'created_at',
        },
    },
    COMPANIES_TO_FILES: {
        NAME: 'companies_to_files',
        COLUMNS: {
            COMPANY_ID: 'company_id',
            FILE_ID: 'file_id',
            CREATED_AT: 'created_at',
        },
    },
    COMPANIES: {
        NAME: 'companies',
        COLUMNS: {
            NAME: 'name',
            HEAD_ROLE_ID: 'head_role_id',
            PRIMARY_CONFIRMED: 'primary_confirmed',
            EDITING_CONFIRMED: 'editing_confirmed',
            COUNTRY_ID: 'country_id',
            IDENTITY_NUMBER: 'identity_number',
            OWNERSHIP_TYPE: 'ownership_type',
            REGISTERED_AT: 'registered_at',
            WEBSITE: 'website',
            LEGAL_CITY_NAME: 'legal_city_name',
            LEGAL_CITY_COORDINATES: 'legal_city_coordinates',
            LEGAL_ADDRESS: 'legal_address',
            SETTLEMENT_ACCOUNT: 'settlement_account',
            POST_ADDRESS: 'post_address',
            BANK_NAME: 'bank_name',
            HEAD_COMPANY_FULL_NAME: 'head_company_full_name',
            BANK_COUNTRY_ID: 'bank_country_id',
            BANK_ADDRESS: 'bank_address',
            BANK_CODE: 'bank_code',
            CONTRACT_SIGNER_FULL_NAME: 'contract_signer_full_name',
            STATE_REGISTRATION_CERTIFICATE_NUMBER: 'state_registration_certificate_number',
            STATE_REGISTRATION_CERTIFICATE_CREATED_AT: 'state_registration_certificate_created_at',
            INSURANCE_POLICY_NUMBER: 'insurance_policy_number',
            INSURANCE_POLICY_CREATED_AT: 'insurance_policy_created_at',
            INSURANCE_POLICY_EXPIRED_AT: 'insurance_policy_expired_at',
            INSURANCE_COMPANY_NAME: 'insurance_company_name',
            RESIDENCY_CERTIFICATE_CREATED_AT: 'residency_certificate_created_at',
            RESIDENCY_CERTIFICATE_EXPIRED_AT: 'residency_certificate_expired_at',
            CREATED_AT: 'created_at',
        },
    },
    PHONE_PREFIXES: {
        NAME: 'phone_prefixes',
        COLUMNS: {
            PREFIX: 'prefix',
            CODE: 'code',
            CREATED_AT: 'created_at',
        },
    },
    PHONE_NUMBERS: {
        NAME: 'phone_numbers',
        COLUMNS: {
            USER_ID: 'user_id',
            NUMBER: 'number',
            PHONE_PREFIX_ID: 'phone_prefix_id',
            CREATED_AT: 'created_at',
        },
    },
    PHONE_CONFIRMATION_CODES: {
        NAME: 'phone_confirmation_codes',
        COLUMNS: {
            USER_ID: 'user_id',
            CODE: 'code',
            EXPIRED_AT: 'expired_at',
            CREATED_AT: 'created_at',
        },
    },
    USERS_TO_PERMISSIONS: {
        NAME: 'users_to_permissions',
        COLUMNS: {
            USER_ID: 'user_id',
            PERMISSION_ID: 'permission_id',
            CREATED_AT: 'created_at',
        },
    },
    COUNTRIES: {
        NAME: 'countries',
        COLUMNS: {
            NAME: 'name',
            CREATED_AT: 'created_at',
        },
    },
    USERS_TO_COMPANIES: {
        NAME: 'users_to_companies',
        COLUMNS: {
            USER_ID: 'user_id',
            COMPANY_ID: 'company_id',
            CREATED_AT: 'created_at',
        },
    },
    OTHER_ORGANIZATIONS: {
        NAME: 'other_organizations',
        COLUMNS: {
            COMPANY_ID: 'company_id',
            NAME: 'name',
            IDENTITY_NUMBER: 'identity_number',
            CREATED_AT: 'created_at',
        },
    },
    ROUTES: {
        NAME: 'routes',
        COLUMNS: {
            COMPANY_ID: 'company_id',
            COORDINATES_FROM: 'coordinates_from',
            COORDINATES_TO: 'coordinates_to',
            CREATED_AT: 'created_at',
        },
    },
    FREEZING_HISTORY: {
        NAME: 'freezing_history',
        COLUMNS: {
            TARGET_ID: 'target_id',
            INITIATOR_ID: 'initiator_id',
            FREEZED: 'freezed',
            CREATED_AT: 'created_at',
        },
    },
    USERS_TO_FILES: {
        NAME: 'users_to_files',
        COLUMNS: {
            USER_ID: 'user_id',
            FILE_ID: 'file_id',
            CREATED_AT: 'created_at',
        },
    },
    DRIVERS: {
        NAME: 'drivers',
        COLUMNS: {
            USER_ID: 'user_id',
            DRIVER_LICENCE_REGISTERED_AT: 'driver_licence_registered_at',
            DRIVER_LICENCE_EXPIRED_AT: 'driver_licence_expired_at',
            CREATED_AT: 'created_at',
        },
    },
    DANGER_CLASSES: {
        NAME: 'danger_classes',
        COLUMNS: {
            CLASS: 'class',
            SUBCLASS: 'subclass',
            NAME: 'name',
            CREATED_AT: 'created_at',
        },
    },
    VEHICLE_TYPES: {
        NAME: 'vehicle_types',
        COLUMNS: {
            NAME: 'name',
            CREATED_AT: 'created_at',
        },
    },
    CARGOS: {
        NAME: 'cargos',
        COLUMNS: {
            COMPANY_ID: 'company_id',
            STATUS_ID: 'status_id',
            UPLOADING_DATE_FROM: 'uploading_date_from',
            UPLOADING_DATE_TO: 'uploading_date_to',
            DOWNLOADING_DATE_FROM: 'downloading_date_from',
            DOWNLOADING_DATE_TO: 'downloading_date_to',
            GROSS_WEIGHT: 'gross_weight',
            WIDTH: 'width',
            HEIGHT: 'height',
            LENGTH: 'length',
            LOADING_METHODS: 'loading_methods',
            GUARANTEES: 'guarantees',
            LOADING_TYPE: 'loading_type',
            DANGER_CLASS_ID: 'danger_class_id',
            VEHICLE_TYPE_ID: 'vehicle_type_id',
            PACKING_DESCRIPTION: 'packing_description',
            DESCRIPTION: 'description',
            FREEZED_AFTER: 'freezed_after',
            CREATED_AT: 'created_at',
        },
    },
    CARGO_POINTS: {
        NAME: 'cargo_points',
        COLUMNS: {
            CARGO_ID: 'cargo_id',
            COORDINATES: 'coordinates',
            TYPE: 'type',
            CREATED_AT: 'created_at',
        },
    },
    CARGO_STATUSES: {
        NAME: 'cargo_statuses',
        COLUMNS: {
            NAME: 'name',
            CREATED_AT: 'created_at',
        },
    },
    ECONOMIC_SETTINGS: {
        NAME: 'economic_settings',
        COLUMNS: {
            COMPANY_ID: 'company_id',
            PERCENT_FROM_TRANSPORTER: 'percent_from_transporter',
            PERCENT_FROM_HOLDER: 'percent_from_holder',
            PERCENT_TO_FORWARDER: 'percent_to_forwarder',
            CREATED_AT: 'created_at',
        },
    },
    CARS: {
        NAME: 'cars',
        COLUMNS: {
            COMPANY_ID: 'company_id',
            CAR_MARK: 'car_mark',
            CAR_MODEL: 'car_model',
            CAR_MADE_YEAR_AT: 'car_made_year_at',
            CAR_TYPE: 'car_type',
            CAR_LOADING_METHODS: 'car_loading_methods',
            CAR_VEHICLE_TYPE_ID: 'car_vehicle_type_id',
            CAR_DANGER_CLASS_ID: 'car_danger_class_id',
            CAR_WIDTH: 'car_width',
            CAR_HEIGHT: 'car_height',
            CAR_LENGTH: 'car_length',
            CAR_WEIGHT: 'car_weight',
            CREATED_AT: 'created_at',
            DELETED: 'deleted',
        },
    },
    TRAILERS: {
        NAME: 'trailers',
        COLUMNS: {
            CAR_ID: 'car_id',
            TRAILER_MARK: 'trailer_mark',
            TRAILER_MODEL: 'trailer_model',
            TRAILER_MADE_YEAR_AT: 'trailer_made_year_at',
            TRAILER_LOADING_METHODS: 'trailer_loading_methods',
            TRAILER_VEHICLE_TYPE_ID: 'trailer_vehicle_type_id',
            TRAILER_DANGER_CLASS_ID: 'trailer_danger_class_id',
            TRAILER_WIDTH: 'trailer_width',
            TRAILER_HEIGHT: 'trailer_height',
            TRAILER_LENGTH: 'trailer_length',
            TRAILER_WEIGHT: 'trailer_weight',
            CREATED_AT: 'created_at',
            DELETED: 'deleted',
        },
    },
    CARS_TO_FILES: {
        NAME: 'cars_to_files',
        COLUMNS: {
            CAR_ID: 'car_id',
            FILE_ID: 'file_id',
            CREATED_AT: 'created_at',
        },
    },
    TRAILERS_TO_FILES: {
        NAME: 'trailers_to_files',
        COLUMNS: {
            TRAILER_ID: 'trailer_id',
            FILE_ID: 'file_id',
            CREATED_AT: 'created_at',
        },
    },
    CARS_STATE_NUMBERS: {
        NAME: 'cars_state_numbers',
        COLUMNS: {
            CAR_ID: 'car_id',
            NUMBER: 'number',
            IS_ACTIVE: 'is_active',
            CREATED_AT: 'created_at',
        },
    },
    TRAILERS_STATE_NUMBERS: {
        NAME: 'trailers_state_numbers',
        COLUMNS: {
            TRAILER_ID: 'trailer_id',
            NUMBER: 'number',
            IS_ACTIVE: 'is_active',
            CREATED_AT: 'created_at',
        },
    },
    LANGUAGES: {
        NAME: 'languages',
        COLUMNS: {
            NAME: 'name',
            CODE: 'code',
            CREATED_AT: 'created_at',
        },
    },
    POINTS: {
        NAME: 'points',
        COLUMNS: {
            COORDINATES: 'coordinates',
            CREATED_AT: 'created_at',
        },
    },
    POINT_TRANSLATIONS: {
        NAME: 'point_translations',
        COLUMNS: {
            POINT_ID: 'point_id',
            LANGUAGE_ID: 'language_id',
            VALUE: 'value',
            CREATED_AT: 'created_at',
        },
    },
};

const NO_SQL_TABLES = {

};

const HOMELESS_COLUMNS = {
    ROLE: 'role',
    ROLE_ID: 'role_id',
    ROLES: 'roles',
    SEARCH: 'search',
    PHONE_NUMBER: 'phone_number',
    PHONE_PREFIX_ID: 'phone_prefix_id',
    OWNER_ID: 'owner_id',
    OTHER_ORGANIZATIONS: 'other_organizations',
    ROUTES: 'routes',
    LONGITUDE: 'longitude',
    LATITUDE: 'latitude',
    FULL_PHONE_NUMBER: 'full_phone_number',
    FILTER: 'filter',
    BANK_COUNTRY: 'bank_country',
    HEAD_ROLE_NAME: 'head_role_name',
    UPLOADING_POINTS: 'uploading_points',
    DOWNLOADING_POINTS: 'downloading_points',
    STATUS: 'status',
    DANGER_CLASS_NAME: 'danger_class_name',
    VEHICLE_TYPE_NAME: 'vehicle_type_name',
    IS_CAR: 'is_car',
    CAR_STATE_NUMBER: 'car_state_number',
    TRAILER_STATE_NUMBER: 'trailer_state_number',
    LANGUAGE_CODE: 'language_code',
    NAME_EN: 'name_en',
    CITY_NAME: 'city_name',
};

module.exports = {
    SQL_TABLES,
    NO_SQL_TABLES,
    HOMELESS_COLUMNS,
};
