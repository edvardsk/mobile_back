const SQL_TABLES = {
    USERS: {
        NAME: 'users',
        COLUMNS: {
            EMAIL: 'email',
            PASSWORD: 'password',
            KEY: 'key',
            FULL_NAME: 'full_name',
            CREATED_AT: 'created_at',
        },
    },
    EMAIL_CONFIRMATION_HASHES: {
        NAME: 'email_confirmation_hashes',
        COLUMNS: {
            USER_ID: 'user_id',
            HASH: 'hash',
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
    FILE_LABELS: {
        NAME: 'file_labels',
        COLUMNS: {
            NAME: 'name',
            DESCRIPTION: 'description',
            CREATED_AT: 'created_at',
        },
    },
    FILES: {
        NAME: 'files',
        COLUMNS: {
            NAME: 'name',
            URL: 'url',
            DESCRIPTION: 'description',
            CREATED_AT: 'created_at',
        },
    },
    FILES_TO_FILE_LABELS: {
        NAME: 'files_to_file_labels',
        COLUMNS: {
            FILE_ID: 'file_id',
            LABEL_ID: 'label_id',
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
    COMPANIES: {
        NAME: 'companies',
        COLUMNS: {
            NAME: 'name',
            COUNTRY_ID: 'country_id',
            IDENTITY_NUMBER: 'identity_number',
            OWNERSHIP_TYPE: 'ownership_type',
            REGISTERED_AT: 'registered_at',
            WEBSITE: 'website',
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
};

const NO_SQL_TABLES = {

};

const HOMELESS_COLUMNS = {
    ROLE: 'role',
    ROLE_ID: 'role_id',
    PHONE_NUMBER: 'phone_number',
    PHONE_PREFIX_ID: 'phone_prefix_id',
};

module.exports = {
    SQL_TABLES,
    NO_SQL_TABLES,
    HOMELESS_COLUMNS,
};
