const { SQL_TABLES } = require('constants/tables');

const colsDraftDrivers = SQL_TABLES.DRAFT_DRIVERS.COLUMNS;

const requiredDriverId = {
    properties: {
        driverId: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        'driverId',
    ],
};

const requiredExistingDriverAsync = {
    $async: true,
    properties: {
        driverId: {
            driver_not_exists: {},
        },
    },
};

const rejectDraft = {
    properties: {
        [colsDraftDrivers.COMMENTS]: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
        },
    },
    required: [
        colsDraftDrivers.COMMENTS,
    ],
    additionalProperties: false,
};

module.exports = {
    requiredDriverId,
    requiredExistingDriverAsync,
    rejectDraft,
};
