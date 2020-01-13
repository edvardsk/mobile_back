const { success, reject } = require('api/response');

// services
const CargosService = require('services/tables/cargos');
const DriversService = require('services/tables/drivers');
const CarsService = require('services/tables/cars');
const CarsStateNumbersService = require('services/tables/cars-state-numbers');
const TrailersService = require('services/tables/trailers');
const TrailersStateNumbersService = require('services/tables/trailers-state-numbers');
const RolesService = require('services/tables/roles');
const UsersService = require('services/tables/users');
const CompaniesService = require('services/tables/companies');
const UsersRolesService = require('services/tables/users-to-roles');
const PhoneNumbersService = require('services/tables/phone-numbers');
const UsersCompaniesService = require('services/tables/users-to-companies');
const DealsService = require('services/tables/deals');
const DealStatusesService = require('services/tables/deal-statuses');
const DealStatusesHistoryService = require('services/tables/deal-statuses-history');
const DealStatusesHistoryConfirmationsService = require('services/tables/deal-statuses-history-confirmations');
const DealCompaniesInfoService = require('services/tables/deal-compnaies-info');
const TablesService = require('services/tables');
const BackgroundService = require('services/background/creators');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { LOADING_TYPES_MAP } = require('constants/cargos');
const { SUCCESS_CODES, ERROR_CODES } = require('constants/http-codes');
const { ROLES } = require('constants/system');
const { DEAL_STATUSES_MAP } = require('constants/deal-statuses');

// formatters
const { formatPricesFromPostgresJSON } = require('formatters/cargo-prices');
const { formatAllInstancesToSave } = require('formatters/deals');
const { formatShadowDriversToSave } = require('formatters/drivers');
const { formatShadowCarsToSave } = require('formatters/cars');
const { formatShadowTrailersToSave } = require('formatters/trailers');

// helpers
const {
    validateCargos,
    validateShadowCars,
    validateShadowTrailers,
    validateCarsTrailers,
    extractData,
} = require('helpers/validators/deals');

const colsCargos = SQL_TABLES.CARGOS.COLUMNS;
const colsUsers = SQL_TABLES.USERS.COLUMNS;
const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;
const colsCompanies = SQL_TABLES.COMPANIES.COLUMNS;

const createCargoDeal = async (req, res, next) => {
    try {
        const { body } = req;
        const { company, user, isControlRole } = res.locals;

        if (!isControlRole && !company[colsCompanies.PRIMARY_CONFIRMED]) {
            return reject(res, ERRORS.SYSTEM.FORBIDDEN, ERROR_CODES.FORBIDDEN);
        }

        const [cargosIds, driversIds, shadowDrivers, carsIds, shadowCars, trailersIds, shadowTrailers] = extractData(body);

        const cargosIdsSet = new Set(cargosIds);
        const drivesIdsSet = new Set(driversIds);
        const carsIdsSet = new Set(carsIds);
        const trailersIdsSet = new Set(trailersIds);

        const shadowDriversSet = new Set(shadowDrivers.map(driver => `${driver[HOMELESS_COLUMNS.PHONE_PREFIX_ID]}${driver[HOMELESS_COLUMNS.PHONE_NUMBER]}`));
        const shadowCarsSet = new Set(shadowCars.map(car => car[HOMELESS_COLUMNS.CAR_STATE_NUMBER]));
        const shadowTrailersSet = new Set(shadowTrailers.map(trailer => trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]));

        /* validate cargos */
        const availableCargos = await CargosService.getAvailableCargosByIds(Array.from(cargosIdsSet));
        if (availableCargos.length !== cargosIdsSet.size) {
            return reject(res, ERRORS.DEALS.NO_ONE_OR_MANY_CARGOS);
        }

        const cargoLoadingType = availableCargos[0][colsCargos.LOADING_TYPE];
        if (!availableCargos.every(cargo => cargo[colsCargos.LOADING_TYPE] === cargoLoadingType)) {
            return reject(res, ERRORS.DEALS.DIFFERENT_CARGO_LOADING_METHOD);
        }

        if (
            (cargoLoadingType === LOADING_TYPES_MAP.FTL && (
                drivesIdsSet.size + shadowDriversSet.size !== body.length ||
                carsIdsSet.size + shadowCarsSet.size !== body.length ||
                trailersIdsSet.size + shadowTrailersSet.size > body.length
            ))
            ||
            (cargoLoadingType === LOADING_TYPES_MAP.LTL && (
                drivesIdsSet.size + shadowDriversSet.size !== 1 ||
                carsIdsSet.size + shadowCarsSet.size !== 1 ||
                (trailersIdsSet.size + shadowTrailersSet.size !== 0 && trailersIdsSet.size + shadowTrailersSet.size !== 1)
            ))
        ) {
            return reject(res, ERRORS.DEALS.DUPLICATE_DATA);
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
        const [invalidItems, availableCars, availableTrailers] = await DealsService.validateDealItems(body, company.id, cargoLoadingType, userLanguageId);
        if (invalidItems.length) {
            return reject(res, invalidItems);
        }

        /* validate shadow cars */
        if (shadowCars.length) {
            const carsStateNumbers = shadowCars.map(car => car[HOMELESS_COLUMNS.CAR_STATE_NUMBER]);
            const carsFromDb = await CarsService.getRecordsByStateNumbers(carsStateNumbers);
            const invalidShadowCars = validateShadowCars(body, carsFromDb);
            if (invalidShadowCars.length) {
                return reject(res, invalidShadowCars);
            }
        }

        /* validate shadow trailers */
        if (shadowTrailers.length) {
            const trailersStateNumbers = shadowTrailers.map(trailer => trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]);
            const trailersFromDb = await TrailersService.getRecordsByStateNumbers(trailersStateNumbers);
            const invalidShadowTrailers = validateShadowTrailers(body, trailersFromDb);
            if (invalidShadowTrailers.length) {
                return reject(res, invalidShadowTrailers);
            }
        }

        /* validate cars and trailers */
        const invalidCarsTrailers = validateCarsTrailers(body, availableCars, availableTrailers, cargoLoadingType);
        if (invalidCarsTrailers.length) {
            return reject(res, invalidCarsTrailers);
        }

        let transactionsList = [];
        /* create all shadow records */
        const allCompaniesIds = availableCargos.map(cargo => cargo[colsCargos.COMPANY_ID]);
        allCompaniesIds.push(company.id); // add transporter company as well
        const allCompaniesIdsUnique = Array.from(new Set(allCompaniesIds));
        const [allCompanies, dealCreatedStatus] = await Promise.all([
            CompaniesService.getCompaniesByIds(allCompaniesIdsUnique),
            DealStatusesService.getRecordStrict(DEAL_STATUSES_MAP.CREATED),
        ]);

        if (allCompanies.length !== allCompaniesIdsUnique.length) {
            return reject(res, ERRORS.DEALS.INVALID_COMPANIES_COUNT);
        }

        const [
            deals, dealStatusesHistory, dealStatusHistoryConfirmations, dealCompaniesInfo,
            newDrivers, newCars, newTrailers, editTrailers
        ] = formatAllInstancesToSave(
            body, availableTrailers, availableCargos, cargoLoadingType, company.id, user.id, dealCreatedStatus.id, allCompanies
        );

        if (newDrivers.length) {
            const role = await RolesService.getRoleByName(ROLES.UNCONFIRMED_DRIVER);
            const [
                users, drives, usersRoles, usersCompanies, phoneNumbers
            ] = formatShadowDriversToSave(newDrivers, role.id, user[colsUsers.LANGUAGE_ID], company.id);
            transactionsList = [
                ...transactionsList,
                UsersService.addUsersAsTransaction(users),
                UsersRolesService.addUserRolesAsTransaction(usersRoles),
                UsersCompaniesService.addRecordsAsTransaction(usersCompanies),
                PhoneNumbersService.addRecordsAsTransaction(phoneNumbers),
                DriversService.addRecordsAsTransaction(drives),
            ];
        }

        if (newCars.length) {
            const [cars, carsNumbers] = formatShadowCarsToSave(newCars, company.id);
            transactionsList = [
                ...transactionsList,
                CarsService.addRecordsAsTransaction(cars),
                CarsStateNumbersService.addRecordsAsTransaction(carsNumbers),
            ];
        }

        if (newTrailers.length) {
            const [trailers, trailersNumbers] = formatShadowTrailersToSave(newTrailers, company.id);
            transactionsList = [
                ...transactionsList,
                TrailersService.addRecordsAsTransaction(trailers),
                TrailersStateNumbersService.addRecordsAsTransaction(trailersNumbers),
            ];
        }

        if (editTrailers.length) {
            transactionsList = [
                ...transactionsList,
                ...editTrailers.map(trailer => (
                    TrailersService.editRecordAsTransaction(trailer[HOMELESS_COLUMNS.TRAILER_ID], {
                        [colsTrailers.CAR_ID]: trailer[HOMELESS_COLUMNS.CAR_ID],
                    })
                )),
            ];
        }

        transactionsList = [
            ...transactionsList,
            DealCompaniesInfoService.addRecordsAsTransaction(dealCompaniesInfo),
            DealsService.addRecordsAsTransaction(deals),
            DealStatusesHistoryService.addRecordsAsTransaction(dealStatusesHistory),
            DealStatusesHistoryConfirmationsService.addRecordsAsTransaction(dealStatusHistoryConfirmations),
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
    createCargoDeal,
};
