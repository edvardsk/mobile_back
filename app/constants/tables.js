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
    FILES: {
        NAME: 'files',
        COLUMNS: {
            NAME: 'name',
            URL: 'url',
            TYPE: 'type',
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
            COUNTRY_ID: 'country_id',
            IDENTITY_NUMBER: 'identity_number',
            OWNERSHIP_TYPE: 'ownership_type',
            REGISTERED_AT: 'registered_at',
            WEBSITE: 'website',
            LEGAL_ADDRESS: 'legal_address',
            SETTLEMENT_ACCOUNT: 'settlement_account',
            POST_ADDRESS: 'post_address',
            BANK_NAME: 'bank_name',
            HEAD_COMPANY_FULL_NAME: 'head_company_full_name',
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
    INVITES: {
        NAME: 'invites',
        COLUMNS: {
            user_id: 'user_id',
            COORDINATES_FROM: 'coordinates_from',
            COORDINATES_TO: 'coordinates_to',
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
    OWNER_ID: 'owner_id',
    OTHER_ORGANIZATIONS: 'other_organizations',
    ROUTES: 'routes',
    LONGITUDE: 'longitude',
    LATITUDE: 'latitude',
};

module.exports = {
    SQL_TABLES,
    NO_SQL_TABLES,
    HOMELESS_COLUMNS,
};
