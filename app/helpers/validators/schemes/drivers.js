
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

module.exports = {
    requiredDriverId,
    requiredExistingDriverAsync,
};
