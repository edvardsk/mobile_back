const uuid = require('uuid/v4');
const { set } = require('lodash');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { LOADING_TYPES_MAP } = require('constants/cargos');

// helpers
const { isValidUUID } = require('helpers/validators');

// formatters
const { formatGeoPoints } = require('./cargos');

const colsDeals = SQL_TABLES.DEALS.COLUMNS;
const colsDealStatuses = SQL_TABLES.DEAL_HISTORY_STATUSES.COLUMNS;
const colsDealStatusesConfirmation = SQL_TABLES.DEAL_STATUSES_HISTORY_CONFIRMATIONS.COLUMNS;
const colsCargo = SQL_TABLES.CARGOS.COLUMNS;
const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsDealHistoryConfirmations = SQL_TABLES.DEAL_STATUSES_HISTORY_CONFIRMATIONS.COLUMNS;

const formatAllInstancesToSave = (arr, availableTrailers, cargoLoadingType, companyId, initiatorId, dealStatusId) => {
    const generatedDriverId = uuid();
    const generatedCarId = uuid();
    const generatedTrailerId = uuid();

    return arr.reduce((acc, item, i) => {
        const [deals, dealHistory, dealStatusHistoryConfirmations, newDrivers, newCars, newTrailers, editTrailers] = acc;
        const cargoId = item[HOMELESS_COLUMNS.CARGO_ID];
        const driverIdOrData = item[HOMELESS_COLUMNS.DRIVER_ID_OR_DATA];
        const carIdOrData = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
        const trailerIdOrData = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];

        let driverId;
        let carId;
        let trailerId;
        if (cargoLoadingType === LOADING_TYPES_MAP.LTL) {
            driverId = isValidUUID(driverIdOrData) ? driverIdOrData : generatedDriverId;
            carId = isValidUUID(carIdOrData) ? carIdOrData : generatedCarId;
            trailerId = isValidUUID(trailerIdOrData) ? trailerIdOrData : generatedTrailerId;
        } else {
            driverId = isValidUUID(driverIdOrData) ? driverIdOrData : uuid();
            carId = isValidUUID(carIdOrData) ? carIdOrData : uuid();
            trailerId = isValidUUID(trailerIdOrData) ? trailerIdOrData : uuid();
        }

        if (!(cargoLoadingType === LOADING_TYPES_MAP.LTL && i > 0)) {
            if (!isValidUUID(driverIdOrData)) {
                newDrivers.push({
                    ...driverIdOrData,
                    [HOMELESS_COLUMNS.DRIVER_ID]: driverId,
                });
            }

            if (!isValidUUID(carIdOrData)) {
                newCars.push({
                    ...carIdOrData,
                    [HOMELESS_COLUMNS.CAR_ID]: carId,
                });
            }

            if (trailerIdOrData && !isValidUUID(trailerIdOrData)) {
                newTrailers.push({
                    ...trailerIdOrData,
                    [HOMELESS_COLUMNS.TRAILER_ID]: trailerId,
                    [HOMELESS_COLUMNS.CAR_ID]: carId,
                });
            } else if (trailerIdOrData && isValidUUID(trailerIdOrData)) {
                const trailerFromDb = availableTrailers.find(trailer => trailer.id === trailerIdOrData);
                if (trailerFromDb) {
                    const carIdWithTrailerFromDb = trailerFromDb[HOMELESS_COLUMNS.CAR_ID];
                    if (!carIdWithTrailerFromDb) {
                        editTrailers.push({
                            [HOMELESS_COLUMNS.TRAILER_ID]: trailerIdOrData,
                            [HOMELESS_COLUMNS.CAR_ID]: carId,
                        });
                    }
                }
            }
        }

        const dealId = uuid();
        deals.push({
            id: dealId,
            [colsDeals.CARGO_ID]: cargoId,
            [colsDeals.TRANSPORTER_COMPANY_ID]: companyId,
            [colsDeals.DRIVER_ID]: driverId,
            [colsDeals.CAR_ID]: carId,
            [colsDeals.TRAILER_ID]: trailerIdOrData ? trailerId : null,
            [colsDeals.PAY_CURRENCY_ID]: item[HOMELESS_COLUMNS.PAY_CURRENCY_ID],
            [colsDeals.PAY_VALUE]: item[HOMELESS_COLUMNS.PAY_VALUE],
            [colsDeals.NAME]: item[colsDeals.NAME] || null,
        });

        const dealHistoryId = uuid();
        dealHistory.push({
            id: dealHistoryId,
            [colsDealStatuses.DEAL_ID]: dealId,
            [colsDealStatuses.INITIATOR_ID]: initiatorId,
            [colsDealStatuses.DEAL_STATUS_ID]: dealStatusId,
        });

        dealStatusHistoryConfirmations.push({
            [colsDealStatusesConfirmation.DEAL_STATUS_HISTORY_ID]: dealHistoryId,
            [colsDealStatusesConfirmation.CONFIRMED_BY_TRANSPORTER]: true, // todo: false for FORWARDER
            [colsDealStatusesConfirmation.CONFIRMED_BY_HOLDER]: false,
        });

        return acc;
    }, [[], [], [], [], [], [], []]);
};

const formatAllInstancesToSaveCarDeal = (arr, cargoLoadingType, companyId, initiatorId, dealStatusId) => {
    const generatedCarId = uuid();
    const generatedTrailerId = uuid();

    return arr.reduce((acc, item) => {
        const [deals, dealHistory] = acc;
        const cargoId = item[HOMELESS_COLUMNS.CARGO_ID];
        const carIdOrData = item[HOMELESS_COLUMNS.CAR_ID_OR_DATA];
        const trailerIdOrData = item[HOMELESS_COLUMNS.TRAILER_ID_OR_DATA];

        let carId;
        let trailerId;
        if (cargoLoadingType === LOADING_TYPES_MAP.LTL) {
            carId = isValidUUID(carIdOrData) ? carIdOrData : generatedCarId;
            trailerId = isValidUUID(trailerIdOrData) ? trailerIdOrData : generatedTrailerId;
        } else {
            carId = isValidUUID(carIdOrData) ? carIdOrData : uuid();
            trailerId = isValidUUID(trailerIdOrData) ? trailerIdOrData : uuid();
        }

        const dealId = uuid();
        deals.push({
            id: dealId,
            [colsDeals.CARGO_ID]: cargoId,
            [colsDeals.TRANSPORTER_COMPANY_ID]: companyId,
            [colsDeals.CAR_ID]: carId,
            [colsDeals.TRAILER_ID]: trailerIdOrData ? trailerId : null,
            [colsDeals.PAY_CURRENCY_ID]: item[HOMELESS_COLUMNS.PAY_CURRENCY_ID],
            [colsDeals.PAY_VALUE]: item[HOMELESS_COLUMNS.PAY_VALUE],
            [colsDeals.NAME]: item[colsDeals.NAME] || null,
        });

        dealHistory.push({
            [colsDealStatuses.DEAL_ID]: dealId,
            [colsDealStatuses.INITIATOR_ID]: initiatorId,
            [colsDealStatuses.DEAL_STATUS_ID]: dealStatusId,
        });
        return acc;
    }, [[], [], [], [], [], []]);
};

const formatRecordForList = (deal, userLanguageId) => {
    const result = {
        id: deal.id,
        [colsDeals.NAME]: deal[colsDeals.NAME],
        [colsDeals.TRAILER_ID]: deal[colsDeals.TRAILER_ID],
        [colsDeals.TRANSPORTER_COMPANY_ID]: deal[colsDeals.TRANSPORTER_COMPANY_ID],
        [colsDeals.DRIVER_ID]: deal[colsDeals.DRIVER_ID],
        [colsDeals.CAR_ID]: deal[colsDeals.CAR_ID],
        [colsDeals.TRAILER_ID]: deal[colsDeals.TRAILER_ID],
        [colsDeals.CREATED_AT]: deal[colsDeals.CREATED_AT],
        [colsDeals.PAY_CURRENCY_ID]: deal[colsDeals.PAY_CURRENCY_ID],
        [colsDeals.PAY_VALUE]: parseFloat(deal[colsDeals.PAY_VALUE]),
        [colsCargo.UPLOADING_DATE_FROM]: deal[colsCargo.UPLOADING_DATE_FROM],
        [colsCargo.UPLOADING_DATE_TO]: deal[colsCargo.UPLOADING_DATE_TO],
        [colsCargo.DOWNLOADING_DATE_FROM]: deal[colsCargo.DOWNLOADING_DATE_FROM],
        [colsCargo.DOWNLOADING_DATE_TO]: deal[colsCargo.DOWNLOADING_DATE_TO],
        [HOMELESS_COLUMNS.DEAL_STATUS]: deal[HOMELESS_COLUMNS.DEAL_STATUS],
    };

    const [uploadingPoints, downloadingPoints] = formatGeoPoints(deal, userLanguageId);

    return {
        ...result,
        [HOMELESS_COLUMNS.UPLOADING_POINTS]: uploadingPoints,
        [HOMELESS_COLUMNS.DOWNLOADING_POINTS]: downloadingPoints,
    };
};

const formatRecordForResponse = (deal, userLanguageId) => {
    const result = {
        id: deal.id,
        [colsDeals.NAME]: deal[colsDeals.NAME],
        [colsDeals.TRANSPORTER_COMPANY_ID]: deal[colsDeals.TRANSPORTER_COMPANY_ID],
        [colsDeals.CREATED_AT]: deal[colsDeals.CREATED_AT],
        [colsDeals.PAY_CURRENCY_ID]: deal[colsDeals.PAY_CURRENCY_ID],
        [colsDeals.PAY_VALUE]: parseFloat(deal[colsDeals.PAY_VALUE]),
        [HOMELESS_COLUMNS.DEAL_STATUS]: deal[HOMELESS_COLUMNS.DEAL_STATUS],
        [colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER]: deal[colsDealHistoryConfirmations.CONFIRMED_BY_HOLDER],
        [colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER]: deal[colsDealHistoryConfirmations.CONFIRMED_BY_TRANSPORTER],

        cargo: {
            [colsCargo.UPLOADING_DATE_FROM]: deal[colsCargo.UPLOADING_DATE_FROM],
            [colsCargo.UPLOADING_DATE_TO]: deal[colsCargo.UPLOADING_DATE_TO],
            [colsCargo.DOWNLOADING_DATE_FROM]: deal[colsCargo.DOWNLOADING_DATE_FROM],
            [colsCargo.DOWNLOADING_DATE_TO]: deal[colsCargo.DOWNLOADING_DATE_TO],
            [colsCargo.DISTANCE]: parseFloat(deal[colsCargo.DISTANCE]),
            [colsCargo.GROSS_WEIGHT]: parseFloat(deal[colsCargo.GROSS_WEIGHT]),
            [colsCargo.WIDTH]: parseFloat(deal[colsCargo.WIDTH]),
            [colsCargo.HEIGHT]: parseFloat(deal[colsCargo.HEIGHT]),
            [colsCargo.LENGTH]: parseFloat(deal[colsCargo.LENGTH]),
        },
        car: {
            [colsDeals.CAR_ID]: deal[colsDeals.CAR_ID],
            [colsCars.CAR_MARK]: deal[colsCars.CAR_MARK],
            [colsCars.CAR_MODEL]: deal[colsCars.CAR_MODEL],
            [colsCars.CAR_WIDTH]: parseFloat(deal[colsCars.CAR_WIDTH]),
            [colsCars.CAR_HEIGHT]: parseFloat(deal[colsCars.CAR_HEIGHT]),
            [colsCars.CAR_LENGTH]: parseFloat(deal[colsCars.CAR_LENGTH]),
            [colsCars.CAR_CARRYING_CAPACITY]: parseFloat(deal[colsCars.CAR_CARRYING_CAPACITY]),
            trailer_id: deal['trailer_id'],
            [colsTrailers.TRAILER_MARK]: deal[colsTrailers.TRAILER_MARK],
            [colsTrailers.TRAILER_MODEL]: deal[colsTrailers.TRAILER_MODEL],
            [colsTrailers.TRAILER_WIDTH]: parseFloat(deal[colsTrailers.TRAILER_WIDTH]),
            [colsTrailers.TRAILER_HEIGHT]: parseFloat(deal[colsTrailers.TRAILER_HEIGHT]),
            [colsTrailers.TRAILER_LENGTH]: parseFloat(deal[colsTrailers.TRAILER_LENGTH]),
            [colsTrailers.TRAILER_CARRYING_CAPACITY]: parseFloat(deal[colsTrailers.TRAILER_CARRYING_CAPACITY]),
        },
        driver: {
            driver_id: deal['driver_id'],
            [colsUsers.FULL_NAME]: deal[colsUsers.FULL_NAME],
            [HOMELESS_COLUMNS.FULL_PHONE_NUMBER]: deal[HOMELESS_COLUMNS.FULL_PHONE_NUMBER],
        }
    };

    const [uploadingPoints, downloadingPoints] = formatGeoPoints(deal, userLanguageId);

    return {
        ...result,
        [HOMELESS_COLUMNS.UPLOADING_POINTS]: uploadingPoints,
        [HOMELESS_COLUMNS.DOWNLOADING_POINTS]: downloadingPoints,
    };
};

const separatePointsInConfirmedRequest = body => Object.keys(body).reduce((acc, key) => {
    const [uploadingPoints, downloadingPoints] = acc;
    const keySplit = key.split('.');
    if (keySplit[0] === HOMELESS_COLUMNS.UPLOADING_POINT) {
        set(uploadingPoints, `${keySplit[1]}.${keySplit[2]}`, body[key]);
    } else if (keySplit[0] === HOMELESS_COLUMNS.DOWNLOADING_POINT) {
        set(downloadingPoints, `${keySplit[1]}.${keySplit[2]}`, body[key]);
    }
    return acc;
}, [{}, {}]);

const formatRecordToEditDataForConfirmedStatusForHolder = body => ({
    [colsDeals.DEPARTURE_CUSTOMS_COUNTRY]: body[colsDeals.DEPARTURE_CUSTOMS_COUNTRY] || null,
    [colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME]: body[colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME] || null,
    [colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER]: body[colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER] || null,
    [colsDeals.ARRIVAL_CUSTOMS_COUNTRY]: body[colsDeals.DEPARTURE_CUSTOMS_COUNTRY] || null,
    [colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_NAME]: body[colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_NAME] || null,
    [colsDeals.ARRIVAL_CUSTOMS_PERSON_FULL_PHONE_NUMBER]: body[colsDeals.DEPARTURE_CUSTOMS_PERSON_FULL_PHONE_NUMBER] || null,
    [colsDeals.TNVED_CODE]: body[colsDeals.TNVED_CODE] || null,
    [colsDeals.INVOICE_CURRENCY_ID]: body[colsDeals.INVOICE_CURRENCY_ID] || null,
    [colsDeals.INVOICE_PRICE]: body[colsDeals.INVOICE_PRICE] || null,
    [colsDeals.STANDARD_LOADING_TIME_HOURS]: body[colsDeals.STANDARD_LOADING_TIME_HOURS] || null,
    [colsDeals.SPECIAL_REQUIREMENTS]: body[colsDeals.SPECIAL_REQUIREMENTS] || null,
});

module.exports = {
    formatAllInstancesToSave,
    formatAllInstancesToSaveCarDeal,
    formatRecordForList,
    formatRecordForResponse,
    separatePointsInConfirmedRequest,
    formatRecordToEditDataForConfirmedStatusForHolder,
};
