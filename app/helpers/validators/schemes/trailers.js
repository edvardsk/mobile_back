// constants
const { SQL_TABLES } = require('constants/tables');

const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;

const requiredExistingTrailerInCompanyAsyncFunc = ({ companyId }) => ({
    $async: true,
    properties: {
        trailerId: {
            trailer_in_company_not_exists: {
                companyId,
            },
        },
    },
});

const requiredExistingTrailerInCompanyWithoutCarAsyncFunc = ({ companyId }) => ({
    $async: true,
    properties: {
        trailerId: {
            trailer_in_company_without_car_not_exists: {
                companyId,
            },
        },
    },
});

const requiredTrailerId = {
    properties: {
        trailerId: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        'trailerId',
    ],
};

const linkTrailerBody = {
    properties: {
        [colsTrailers.CAR_ID]: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        colsTrailers.CAR_ID,
    ],
    additionalProperties: false,
};

const linkTrailerBodyAsyncFunc = ({ companyId }) => ({
    $async: true,
    properties: {
        [colsTrailers.CAR_ID]: {
            required_existing_car_in_company_without_trailer: {
                companyId,
            },
        },
    },
});

module.exports = {
    requiredExistingTrailerInCompanyAsyncFunc,
    requiredExistingTrailerInCompanyWithoutCarAsyncFunc,
    requiredTrailerId,
    linkTrailerBody,
    linkTrailerBodyAsyncFunc,
};
