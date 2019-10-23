const { SQL_TABLES } = require('constants/tables');

const colsRoutes = SQL_TABLES.ROUTES.COLUMNS;

const formatRoutesToSave = (values, companyId) => values.map(value => formatRouteToSave(value, companyId));

const formatRouteToSave = (route, companyId) => ({
    ...route,
    [colsRoutes.COMPANY_ID]: companyId,
});

module.exports = {
    formatRoutesToSave,
};
