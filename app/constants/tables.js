const SQL_TABLES = {
    USERS: {
        NAME: 'users',
        COLUMNS: {
            NAME: 'name',
            PASSWORD: 'password',
            KEY: 'key',
            CREATED_AT: 'created_at',
        },
    },
        COLUMNS: {
            USER_ID: 'user_id',
            HASH: 'hash',
            CREATED_AT: 'created_at',

    FORGOT_PASSWORD: {
        NAME: 'forgot_password',
            EXPIRED_AT: 'expired_at',
        },
    },
};

module.exports = {
    SQL_TABLES,
};
