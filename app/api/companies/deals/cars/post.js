const { success, reject } = require('api/response');

// services
const CargosService = require('services/tables/cargos');
const DealsService = require('services/tables/deals');
const CompaniesService = require('services/tables/companies');
const DealStatusesService = require('services/tables/deal-statuses');
const DealStatusesHistoryService = require('services/tables/deal-statuses-history');
const DealStatusesHistoryConfirmationsService = require('services/tables/deal-statuses-history-confirmations');
const DealCompaniesInfoService = require('services/tables/deal-compnaies-info');
const TablesService = require('services/tables');
const BackgroundService = require('services/background/creators');
const EconomicSettingsServices = require('services/tables/economic-settings');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { SUCCESS_CODES, ERROR_CODES } = require('constants/http-codes');
const { DEAL_STATUSES_MAP } = require('constants/deal-statuses');

// formatters
const { formatPricesFromPostgresJSON } = require('formatters/cargo-prices');
const { formatAllInstancesToSaveCarDeal } = require('formatters/deals');

// helpers
const {
    validateCargos,
    validateCarsTrailers,
    extractData,
} = require('helpers/validators/deals');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;
const colsCars = SQL_TABLES.CARS.COLUMNS;

const createCarDeal = async (req, res, next) => {
    try {
        const { body } = req;

        const { company, user, isControlRole } = res.locals;
        if (!isControlRole && !company[colsCompanies.PRIMARY_CONFIRMED]) {
            return reject(res, ERRORS.SYSTEM.FORBIDDEN, ERROR_CODES.FORBIDDEN);
        }

        const [cargosIds] = extractData(body);

        const cargosIdsSet = new Set(cargosIds);

        /* validate cargos */
        const availableCargos = await CargosService.getAvailableCargosByIds(Array.from(cargosIdsSet));
        if (availableCargos.length !== cargosIdsSet.size) {
            return reject(res, ERRORS.DEALS.NO_ONE_OR_MANY_CARGOS);
        }

        const cargoLoadingType = availableCargos[0][colsCargos.LOADING_TYPE];
        if (!availableCargos.every(cargo => cargo[colsCargos.LOADING_TYPE] === cargoLoadingType)) {
            return reject(res, ERRORS.DEALS.DIFFERENT_CARGO_LOADING_METHOD);
        }

        const cargosFromDb = availableCargos.map(cargo => ({
            ...cargo,
            [HOMELESS_COLUMNS.PRICES]: formatPricesFromPostgresJSON(cargo[HOMELESS_COLUMNS.PRICES]),
        }));

        const [invalidCargos, takenCargos] = validateCargos(body, cargosFromDb);
        if (invalidCargos.length) {
            return reject(res, invalidCargos);
        }

        const userLanguageId = user[colsUsers.LANGUAGE_ID];
        const [invalidItems, availableCars, availableTrailers] = await DealsService.validateCarDealItems(body, company.id, cargoLoadingType, userLanguageId);
        if (invalidItems.length) {
            return reject(res, invalidItems);
        }

        /* validate cars and trailers */
        const invalidCarsTrailers = validateCarsTrailers(body, availableCars, availableTrailers, cargoLoadingType);
        if (invalidCarsTrailers.length) {
            return reject(res, invalidCarsTrailers);
        }

        let transactionsList = [];

        const transporterCompanyId = availableCars && availableCars[0] && availableCars[0][colsCars.COMPANY_ID];
        const [defaultEconomicSettings, companyEconomySettings] = await Promise.all([
            EconomicSettingsServices.getDefaultRecordStrict(),
            EconomicSettingsServices.getRecordByCompanyId(transporterCompanyId),
        ]);
        /* create all shadow records */
        const allCompaniesIds = [company.id, transporterCompanyId];
        const [allCompanies, dealCreatedStatus] = await Promise.all([
            CompaniesService.getCompaniesByIds(allCompaniesIds),
            DealStatusesService.getRecordStrict(DEAL_STATUSES_MAP.CREATED),
        ]);

        if (allCompanies.length !== allCompaniesIds.length) {
            return reject(res, ERRORS.DEALS.INVALID_COMPANIES_COUNT);
        }

        const [
            deals, dealStatusesHistory, dealStatusHistoryConfirmations, dealCompaniesInfo
        ] = formatAllInstancesToSaveCarDeal(
            body, cargoLoadingType, company.id, transporterCompanyId, user.id, dealCreatedStatus.id,
            defaultEconomicSettings, companyEconomySettings, allCompanies
        );

        transactionsList = [
            ...transactionsList,
            DealCompaniesInfoService.addRecordsAsTransaction(dealCompaniesInfo),
            DealsService.addRecordsAsTransaction(deals),
            DealStatusesHistoryService.addRecordsAsTransaction(dealStatusesHistory),
            DealStatusesHistoryConfirmationsService.addRecordsAsTransaction(dealStatusHistoryConfirmations),
        ];

        transactionsList = [
            ...transactionsList,
            ...Object.keys(takenCargos).map(id => CargosService.editRecordDecreaseFreeCountAsTransaction(id, takenCargos[id])),
        ];

        await TablesService.runTransaction(transactionsList);
        await Promise.all(deals.map(({ id }) => (
            BackgroundService.autoCancelUnconfirmedDealCreator(id)
        )));

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCarDeal,
};
