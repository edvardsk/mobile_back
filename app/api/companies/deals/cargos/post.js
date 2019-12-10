const { success, reject } = require('api/response');

// services
const CargosService = require('services/tables/cargos');
const DriversService = require('services/tables/drivers');
const CarsService = require('services/tables/cars');
const TrailersService = require('services/tables/trailers');
const RolesService = require('services/tables/roles');
const UsersService = require('services/tables/users');
const UsersRolesService = require('services/tables/users-to-roles');
const PhoneNumbersService = require('services/tables/phone-numbers');
const UsersCompaniesService = require('services/tables/users-to-companies');
const DealsService = require('services/tables/deals');
const TablesService = require('services/tables');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { LOADING_TYPES_MAP } = require('constants/cargos');
const { SUCCESS_CODES } = require('constants/http-codes');
const { ROLES } = require('constants/system');

// formatters
const { formatPricesFromPostgresJSON } = require('formatters/cargo-prices');
const { formatAllInstancesToSave } = require('formatters/deals');
const { formatShadowDriversToSave } = require('formatters/drivers');

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

const createCargoDeal = async (req, res, next) => {
    try {
        const { body } = req;

        const { company, user } = res.locals;

        const [cargosIds, driversIds, shadowDrivers, carsIds, shadowCars, trailersIds, shadowTrailers] = extractData(body);

        /* validate cargos */
        const availableCargos = await CargosService.getAvailableCargosByIds(cargosIds);
        if (!availableCargos.length) {
            return reject(res, ERRORS.DEALS.NO_CARGOS);
        }

        const cargoLoadingType = availableCargos[0][colsCargos.LOADING_TYPE];
        if (!availableCargos.every(cargo => cargo[colsCargos.LOADING_TYPE] === cargoLoadingType)) {
            return reject(res, ERRORS.DEALS.DIFFERENT_CARGO_LOADING_METHOD);
        }

        const cargosIdsSet = new Set(cargosIds);
        const drivesIdsSet = new Set(driversIds);
        const carsIdsSet = new Set(carsIds);
        const trailersIdsSet = new Set(trailersIds);

        const shadowDriversSet = new Set(shadowDrivers.map(driver => `${driver[HOMELESS_COLUMNS.PHONE_PREFIX_ID]}${driver[HOMELESS_COLUMNS.PHONE_NUMBER]}`));
        const shadowCarsSet = new Set(shadowCars.map(car => car[HOMELESS_COLUMNS.CAR_STATE_NUMBER]));
        const shadowTrailersSet = new Set(shadowTrailers.map(trailer => trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER]));

        if (
            (cargoLoadingType === LOADING_TYPES_MAP.FTL && (
                drivesIdsSet.size + shadowDriversSet.size !== body.length ||
                carsIdsSet.size + shadowCarsSet.size !== body.length ||
                trailersIdsSet.size + shadowTrailersSet.size > body.length
            ))
            ||
            (cargoLoadingType === LOADING_TYPES_MAP.LTL && (
                cargosIdsSet.size !== cargosIds.length ||
                drivesIdsSet.size + shadowDriversSet.size !== 1 ||
                carsIdsSet.size + shadowCarsSet.size !== 1 ||
                trailersIdsSet.size + shadowTrailersSet.size > 1
            ))
        ) {
            return reject(res, ERRORS.DEALS.DUPLICATE_DATA);
        }

        const cargosFromDb = availableCargos.map(cargo => ({
            ...cargo,
            [HOMELESS_COLUMNS.PRICES]: formatPricesFromPostgresJSON(cargo[HOMELESS_COLUMNS.PRICES]),
        }));

        const invalidCargos = validateCargos(body, cargosFromDb, cargoLoadingType);
        if (invalidCargos.length) {
            return reject(res, invalidCargos);
        }

        const [invalidItems, availableCars, availableTrailers] = await DealsService.validateDealItems(body, company.id);
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
        const [
            deals, newDrivers, newCars, newTrailers, editTrailers
        ] = formatAllInstancesToSave(body, availableTrailers, cargoLoadingType, company.id);
        console.log(deals);

        if (newDrivers.length) {
            const role = await RolesService.getRoleByName(ROLES.UNCONFIRMED_DRIVER);
            const [
                users, drives, usersRoles, usersCompanies, phoneNumbers
            ] = formatShadowDriversToSave(newDrivers, role.id, user[colsUsers.LANGUAGE_ID], company.id);
            transactionsList = [
                ...transactionsList,
                // UsersService.addUserAsTransaction(users),
                // UsersRolesService.addUserRoleAsTransaction(usersRoles),
                // UsersCompaniesService.addRecordAsTransaction(usersCompanies),
                // PhoneNumbersService.addRecordAsTransaction(phoneNumbers),
                // DriversService.addRecordsAsTransaction(drives),
            ];
        }

        // await TablesService.runTransaction(transactionsList);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCargoDeal,
};
