const API_PREFIX = '/api/v1';

const BASES = {
    REGISTRATION: '/registration',
    AUTHORIZATION: '/authorization',
    CONFIRM_EMAIL: '/confirm-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET: '/reset',
    CHANGE: '/change',
    USERS: '/users',
    FINISH_REGISTRATION: '/finish-registration',
    ME: '/me',
    ROLES: '/roles',
};

const ROUTES = {
    AUTH: {
        BASE: '/',
        REGISTRATION: {
            BASE: BASES.REGISTRATION,
            POST: '',
            ROLES: {
                BASE: BASES.ROLES,
                GET: '',
            }
        },
        AUTHORIZATION: {
            BASE: BASES.AUTHORIZATION,
            POST: '',
        },
        CONFIRM_EMAIL: {
            BASE: BASES.CONFIRM_EMAIL,
            GET: '',
        },
        FORGOT_PASSWORD: {
            BASE: BASES.FORGOT_PASSWORD,
            RESET: {
                BASE: BASES.RESET,
                POST: ''
            },
            CHANGE: {
                BASE: BASES.CHANGE,
                POST: '',
            },
        },
        FINISH_REGISTRATION: {
            BASE: BASES.FINISH_REGISTRATION,
        },
    },
    USERS: {
        BASE: BASES.USERS,
        GET: '',
        ME: {
            BASE: BASES.ME,
            GET: '',
        }
    },
};

const ALLOWED_ROUTES = {
    GET: new Set([
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.ROLES.BASE + ROUTES.AUTH.REGISTRATION.ROLES.GET,
    ]),
    POST: new Set([
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.POST,
        API_PREFIX + ROUTES.AUTH.AUTHORIZATION.BASE + ROUTES.AUTH.AUTHORIZATION.POST,

        API_PREFIX + ROUTES.AUTH.FORGOT_PASSWORD.BASE + ROUTES.AUTH.FORGOT_PASSWORD.RESET.BASE + ROUTES.AUTH.FORGOT_PASSWORD.RESET.POST,
        API_PREFIX + ROUTES.AUTH.FORGOT_PASSWORD.BASE + ROUTES.AUTH.FORGOT_PASSWORD.CHANGE.BASE + ROUTES.AUTH.FORGOT_PASSWORD.CHANGE.POST,

        API_PREFIX + ROUTES.AUTH.CONFIRM_EMAIL.BASE + ROUTES.AUTH.CONFIRM_EMAIL.GET,
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
