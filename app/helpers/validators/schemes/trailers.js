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

const requiredTrailerId = {
    properties: {
        trailerId: {
            type: 'string',
            format: 'uuid',
        },
    },
    required: [
        'trailerId',
    ]
};

module.exports = {
    requiredExistingTrailerInCompanyAsyncFunc,
    requiredTrailerId,
};
