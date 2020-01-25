const API_PREFIX = '/api/v1';

const BASES = {
    REGISTRATION: '/registration',
    AUTHORIZATION: '/authorization',
    USERS: '/users',
    ME: '/me',
    CHARACTERISTICS: '/characteristics',
};

const ROUTES = {
    AUTH: {
        BASE: '/',
        REGISTRATION: {
            BASE: BASES.REGISTRATION,
            POST: '',
        },
        AUTHORIZATION: {
            BASE: BASES.AUTHORIZATION,
            POST: '',
        },
    },
    USERS: {
        BASE: BASES.USERS,
        GET_ALL: '',
        ME: {
            BASE: BASES.ME,
            GET: '',
            CHARACTERISTICS: '/characteristics'
        },
    },
};

const ALLOWED_ROUTES = {
    GET: new Set([

    ]),
    POST: new Set([
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.POST,
        API_PREFIX + ROUTES.AUTH.AUTHORIZATION.BASE + ROUTES.AUTH.AUTHORIZATION.POST,
    ]),
    PUT: new Set([

    ]),
    DELETE: new Set([

    ]),
    PATCH: new Set([

    ]),
};

module.exports = {
    API_PREFIX,
    ROUTES,
    ALLOWED_ROUTES,
};
