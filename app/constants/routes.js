const { ROLES } = require('./system');

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
    INVITES: '/invites',
    MANAGER: '/manager',
    RESEND: '/resend',
    COMPANIES: '/companies',
    EMPLOYEES: '/employees',
    LEGAL_DATA: '/legal-data',
    FREEZE: '/freeze',
    UNFREEZE: '/unfreeze',
    FILES: '/files',
    GROUPS: '/groups',
    MANAGEMENT: '/management',
    COMMON_DATA: '/common-data',
    APPROVE: '/approve',
    CARGOS: '/cargos',
    OTHERS: '/others',
    VEHICLE_TYPES: '/vehicle-types',
    DANGER_CLASSES: '/danger-classes',
    DEAL_STATUSES: '/deal-statuses',
    TNVED_CODES: '/tnved-codes',
    KEYWORDS: '/keywords',
    SETTINGS: '/settings',
    ECONOMICS: '/economics',
    DEFAULT: '/default',
    CARS: '/cars',
    LANGUAGES: '/languages',
    CURRENCIES: '/currencies',
    TRAILERS: '/trailers',
    LINK: '/link',
    UNLINK: '/unlink',
    SEARCH: '/search',
    AVAILABLE: '/available',
    DEALS: '/deals',
    DRIVERS: '/drivers',
    EXCHANGE_RATES: '/exchange-rates',
    VERIFY: '/verify',
    REJECT: '/reject',
};

const IDS = {
    USER_ID: '/:userId',
    ROLE: '/:role',
    ME: '/:me',
    ME_OR_ID: '/:meOrId',
    FILE_GROUP: '/:fileGroup',
    COMPANY_ID: '/:companyId',
    CARGO_ID: '/:cargoId',
    CAR_ID: '/:carId',
    TRAILER_ID: '/:trailerId',
    DRIVER_ID: '/:driverId',
    KEYWORD_ID: '/:keywordId',
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
                GET_ALL: '',
            },
            LANGUAGES: {
                BASE: BASES.LANGUAGES,
                GET_ALL: '',
            },
        },
        AUTHORIZATION: {
            BASE: BASES.AUTHORIZATION,
            POST: '',
            MANAGEMENT: {
                BASE: BASES.MANAGEMENT,
                POST: '',
            },
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
        GET_ALL: '',
        ME: {
            BASE: BASES.ME,
            GET: '',
        },
        FREEZE: {
            BASE: IDS.USER_ID + BASES.FREEZE,
            POST: '',
        },
        UNFREEZE: {
            BASE: IDS.USER_ID + BASES.UNFREEZE,
            POST: '',
        },
    },
    CONDITIONS_TERMS: {
        BASE: BASES.CONDITIONS_TERMS,
        GET: '',
        POST: '',
    },
    INVITES: {
        BASE: BASES.INVITES,
        ROLES: {
            BASE: BASES.ROLES,
            POST: IDS.ROLE,
            GET_ALL: '',
        },
        COMPANIES: {
            BASE: BASES.COMPANIES,
            ROLES: {
                BASE: IDS.ME_OR_ID + BASES.ROLES,
                POST: IDS.ROLE,
            },
        },
        ADVANCED: {
            BASE: BASES.ADVANCED,
            COMPANIES: {
                BASE: BASES.COMPANIES,
                ROLES: {
                    BASE: IDS.ME_OR_ID + BASES.ROLES,
                    POST: IDS.ROLE,
                },
            },
        },
        RESEND: {
            BASE: BASES.RESEND,
            USERS: {
                BASE: BASES.USERS,
                POST: IDS.USER_ID,
            }
        },
    },
    COMPANIES: {
        BASE: BASES.COMPANIES,
        GET_ALL: '',
        GET: IDS.ME_OR_ID,
        APPROVE: {
            BASE: IDS.COMPANY_ID + BASES.APPROVE,
            POST: '',
        },
        EMPLOYEES: {
            BASE: IDS.ME_OR_ID + BASES.EMPLOYEES,
            GET_ALL: '',
            ROLES: {
                BASE: BASES.ROLES,
                GET: `/${ROLES.DRIVER}`,
            },
            USERS: {
                BASE: BASES.USERS,
                GET: IDS.USER_ID,
                ADVANCED: {
                    BASE: IDS.USER_ID + BASES.ADVANCED,
                    PUT: '',
                },
            },
        },
        COMMON_DATA: {
            BASE: IDS.ME_OR_ID + BASES.COMMON_DATA,
            GET: '',
        },
        LEGAL_DATA: {
            BASE: IDS.ME_OR_ID + BASES.LEGAL_DATA,
            GET: '',
        },
        FILES: {
            BASE: IDS.ME_OR_ID + BASES.FILES,
            GROUPS: {
                BASE: BASES.GROUPS,
                GET: IDS.FILE_GROUP,
            }
        },
        STEPS: {
            BASE: IDS.ME_OR_ID + BASES.STEPS,
            1: {
                BASE: BASES['1'],
                POST: '',
                GET: '',
            },
            2: {
                BASE: BASES['2'],
                POST: '',
                GET: '',
            },
            3: {
                BASE: BASES['3'],
                POST: '',
                GET: '',
            },
        },
        CARGOS: {
            BASE: IDS.ME_OR_ID + BASES.CARGOS,
            POST: '',
            GET_ALL: '',
            GET: IDS.CARGO_ID,
            PUT: IDS.CARGO_ID,
            DELETE: IDS.CARGO_ID,
        },
        CARS: {
            BASE: IDS.ME_OR_ID + BASES.CARS,
            POST: '',
            GET_ALL: '',
            GET: IDS.CAR_ID,
            PUT: IDS.CAR_ID,
            DELETE: IDS.CAR_ID,
            DEALS: {
                BASE: BASES.DEALS,
                CARGOS: {
                    BASE: BASES.CARGOS,
                    AVAILABLE: {
                        BASE: IDS.CARGO_ID + BASES.AVAILABLE,
                        GET: '',
                    },
                },
            },
        },
        TRAILERS: {
            BASE: IDS.ME_OR_ID + BASES.TRAILERS,
            GET_ALL: '',
            GET: IDS.TRAILER_ID,
            DELETE: IDS.TRAILER_ID,
            PUT: IDS.TRAILER_ID,
            LINK: {
                BASE: IDS.TRAILER_ID + BASES.LINK,
                POST: '',
            },
            UNLINK: {
                BASE: IDS.TRAILER_ID + BASES.UNLINK,
                POST: '',
            },
            DEALS: {
                BASE: BASES.DEALS,
                CARGOS: {
                    BASE: BASES.CARGOS,
                    AVAILABLE: {
                        BASE: IDS.CARGO_ID + BASES.AVAILABLE,
                        GET: '',
                    },
                },
            },
        },
        DRIVERS: {
            BASE: IDS.ME_OR_ID + BASES.DRIVERS,
            DEALS: {
                BASE: BASES.DEALS,
                CARGOS: {
                    BASE: BASES.CARGOS,
                    AVAILABLE: {
                        BASE: IDS.CARGO_ID + BASES.AVAILABLE,
                        GET: '',
                    },
                },

            },
        },
        DEALS: {
            BASE: IDS.ME_OR_ID + BASES.DEALS,
            CARGOS: {
                BASE: BASES.CARGOS,
                POST: '',
            },
        },
    },
    OTHERS: {
        BASE: BASES.OTHERS,
        VEHICLE_TYPES: {
            BASE: BASES.VEHICLE_TYPES,
            GET_ALL: '',
        },
        DANGER_CLASSES: {
            BASE: BASES.DANGER_CLASSES,
            GET_ALL: '',
        },
        CURRENCIES: {
            BASE: BASES.CURRENCIES,
            GET_ALL: '',
        },
        EXCHANGE_RATES: {
            BASE: BASES.EXCHANGE_RATES,
            GET_ALL: '',
        },
        DEAL_STATUSES: {
            BASE: BASES.DEAL_STATUSES,
            GET_ALL: '',
        },
        TNVED_CODES: {
            BASE: BASES.TNVED_CODES,
            GET: '',
            GET_ALL: '/all',
            KEYWORDS: {
                BASE: BASES.KEYWORDS,
                POST: '',
                GET_ALL: '/all',
                GET: '',
                PUT: IDS.KEYWORD_ID,
                DELETE: IDS.KEYWORD_ID,
            },
        },
    },
    SETTINGS: {
        BASE: BASES.SETTINGS,
        ECONOMICS: {
            BASE: BASES.ECONOMICS,
            DEFAULT: {
                BASE: BASES.DEFAULT,
                GET: '',
                PUT: '',
            },
            COMPANIES: {
                BASE: BASES.COMPANIES,
                POST: IDS.COMPANY_ID,
                PUT: IDS.COMPANY_ID,
                GET: IDS.COMPANY_ID,
                DELETE: IDS.COMPANY_ID,
                GET_ALL: '',
            },
        },
    },
    SEARCH: {
        BASE: BASES.SEARCH,
        GET: '',
        GET_ALL: '/all',
    },
    CARGOS: {
        BASE: BASES.CARGOS,
        GET: IDS.CARGO_ID,
    },
    CARS: {
        BASE: BASES.CARS,
        GET: IDS.CAR_ID,
        VERIFY: {
            BASE: IDS.CAR_ID + BASES.VERIFY,
            POST: '',
        },
        REJECT: {
            BASE: IDS.CAR_ID + BASES.REJECT,
            POST: '',
        },
    },
    TRAILERS: {
        BASE: BASES.TRAILERS,
        GET: IDS.TRAILER_ID,
        VERIFY: {
            BASE: IDS.TRAILER_ID + BASES.VERIFY,
            POST: '',
        },
        REJECT: {
            BASE: IDS.TRAILER_ID + BASES.REJECT,
            POST: '',
        },
    },
    DRIVERS: {
        BASE: BASES.DRIVERS,
        VERIFY: {
            BASE: IDS.DRIVER_ID + BASES.VERIFY,
            POST: '',
        },
        REJECT: {
            BASE: IDS.DRIVER_ID + BASES.REJECT,
            POST: '',
        },
    },
};

const ALLOWED_ROUTES = {
    GET: new Set([
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.ROLES.BASE + ROUTES.AUTH.REGISTRATION.ROLES.GET,
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.PHONE_PREFIXES.BASE + ROUTES.AUTH.REGISTRATION.PHONE_PREFIXES.GET,
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.LANGUAGES.BASE + ROUTES.AUTH.REGISTRATION.LANGUAGES.GET_ALL,

        API_PREFIX + ROUTES.SEARCH.BASE + ROUTES.SEARCH.GET,
        API_PREFIX + ROUTES.SEARCH.BASE + ROUTES.SEARCH.GET_ALL,

        API_PREFIX + ROUTES.CARGOS.BASE + ROUTES.CARGOS.GET,
        API_PREFIX + ROUTES.CARS.BASE + ROUTES.CARS.GET,
        API_PREFIX + ROUTES.TRAILERS.BASE + ROUTES.TRAILERS.GET,

        API_PREFIX + ROUTES.OTHERS.BASE + ROUTES.OTHERS.VEHICLE_TYPES.BASE + ROUTES.OTHERS.VEHICLE_TYPES.GET_ALL,
        API_PREFIX + ROUTES.OTHERS.BASE + ROUTES.OTHERS.DANGER_CLASSES.BASE + ROUTES.OTHERS.DANGER_CLASSES.GET_ALL,
        API_PREFIX + ROUTES.OTHERS.BASE + ROUTES.OTHERS.CURRENCIES.BASE + ROUTES.OTHERS.CURRENCIES.GET_ALL,
        API_PREFIX + ROUTES.OTHERS.BASE + ROUTES.OTHERS.EXCHANGE_RATES.BASE + ROUTES.OTHERS.EXCHANGE_RATES.GET_ALL,
        API_PREFIX + ROUTES.OTHERS.BASE + ROUTES.OTHERS.DEAL_STATUSES.BASE + ROUTES.OTHERS.DEAL_STATUSES.GET_ALL,

        API_PREFIX + ROUTES.OTHERS.BASE + ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.GET,
        API_PREFIX + ROUTES.OTHERS.BASE + ROUTES.OTHERS.TNVED_CODES.BASE + ROUTES.OTHERS.TNVED_CODES.GET_ALL,
    ]),
    POST: new Set([
        API_PREFIX + ROUTES.AUTH.REGISTRATION.BASE + ROUTES.AUTH.REGISTRATION.POST,
        API_PREFIX + ROUTES.AUTH.AUTHORIZATION.BASE + ROUTES.AUTH.AUTHORIZATION.POST,
        API_PREFIX + ROUTES.AUTH.AUTHORIZATION.BASE + ROUTES.AUTH.AUTHORIZATION.MANAGEMENT.BASE + ROUTES.AUTH.AUTHORIZATION.MANAGEMENT.POST,

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
