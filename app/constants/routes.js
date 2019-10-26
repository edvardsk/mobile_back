const API_PREFIX = '/api/v1';

const BASES = {
    REGISTRATION: '/registration',
    AUTHORIZATION: '/authorization',
    CONFIRM_EMAIL: '/confirm-email',
    ADVANCED: '/advanced',
    FORGOT_PASSWORD: '/forgot-password',
    RESET: '/reset',
    CHANGE: '/change',
    USERS: '/users',
    FINISH_REGISTRATION: '/finish-registration',
    ME: '/me',
    ROLES: '/roles',
    PHONE_PREFIXES: '/phone-prefixes',
    COUNTRIES: '/countries',
    PHONE_NUMBERS: '/phone-numbers',
    SEND_CODE: '/send-code',
    CONFIRM_PRONE: '/confirm-phone',
    STEPS: '/steps',
    1: '/1',
    2: '/2',
    3: '/3',
    4: '/4',
    5: '/5',
    CONDITIONS_TERMS: '/conditions-terms',
    ACCOUNT_CONFIRMATIONS: '/account-confirmations',
    INVITES: '/invites',
    MANAGER: '/manager',
    RESEND: '/resend',
};

const IDS = {
    USER_ID: '/:userId',
    ROLE: '/:role',
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
            },
            PHONE_PREFIXES: {
                BASE: BASES.PHONE_PREFIXES,
                GET: '',
            },
            COUNTRIES: {
                BASE: BASES.COUNTRIES,
                GET: '',
            },
        },
        AUTHORIZATION: {
            BASE: BASES.AUTHORIZATION,
            POST: '',
        },
        CONFIRM_EMAIL: {
            BASE: BASES.CONFIRM_EMAIL,
            POST: '',
            ADVANCED: {
                BASE: BASES.ADVANCED,
                POST: '',
            }
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
            STEPS: {
                BASE: BASES.STEPS,
                1: {
                    BASE: BASES['1'],
                    POST: '',
                },
                2: {
                    BASE: BASES['2'],
                    POST: '',
                },
                3: {
                    BASE: BASES['3'],
                    POST: '',
                },
                4: {
                    BASE: BASES['4'],
                    POST: '',
                },
                5: {
                    BASE: BASES['5'],
                    POST: '',
                },
            }
        },
        PHONE_NUMBERS: {
            BASE: BASES.PHONE_NUMBERS,
            SEND_CODE: {
                BASE: BASES.SEND_CODE,
                POST: '',
            },
            CONFIRM_PHONE: {
                BASE: BASES.CONFIRM_PRONE,
                POST: '',
            },
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
    CONDITIONS_TERMS: {
        BASE: BASES.CONDITIONS_TERMS,
        GET: '',
        POST: '',
    },
    ACCOUNT_CONFIRMATIONS: {
        BASE: BASES.ACCOUNT_CONFIRMATIONS,
        USERS: {
            BASE: BASES.USERS,
            GET_ALL: '',
            GET: IDS.USER_ID,
            POST: IDS.USER_ID,
        },
    },
    INVITES: {
        BASE: BASES.INVITES,
        POST: IDS.ROLE,
        RESEND: {
            BASE: BASES.RESEND,
            POST: '',
        },
    },
};

const ALLOWED_ROUTES = {
    GET: new Set([
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.ROLES.BASE + ROUTES.AUTH.REGISTRATION.ROLES.GET,
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.PHONE_PREFIXES.BASE + ROUTES.AUTH.REGISTRATION.PHONE_PREFIXES.GET,
    ]),
    POST: new Set([
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.POST,
        API_PREFIX + ROUTES.AUTH.AUTHORIZATION.BASE + ROUTES.AUTH.AUTHORIZATION.POST,

        API_PREFIX + ROUTES.AUTH.FORGOT_PASSWORD.BASE + ROUTES.AUTH.FORGOT_PASSWORD.RESET.BASE + ROUTES.AUTH.FORGOT_PASSWORD.RESET.POST,
        API_PREFIX + ROUTES.AUTH.FORGOT_PASSWORD.BASE + ROUTES.AUTH.FORGOT_PASSWORD.CHANGE.BASE + ROUTES.AUTH.FORGOT_PASSWORD.CHANGE.POST,

        API_PREFIX + ROUTES.AUTH.CONFIRM_EMAIL.BASE + ROUTES.AUTH.CONFIRM_EMAIL.POST,
        API_PREFIX + ROUTES.AUTH.CONFIRM_EMAIL.BASE + ROUTES.AUTH.CONFIRM_EMAIL.ADVANCED.BASE + ROUTES.AUTH.CONFIRM_EMAIL.ADVANCED.POST,
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
