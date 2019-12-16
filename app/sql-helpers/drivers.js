const squel = require('squel');
const { get } = require('lodash');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const table = SQL_TABLES.DRIVERS;
const tableUsers = SQL_TABLES.USERS;
const tableUsersCompanies = SQL_TABLES.USERS_TO_COMPANIES;
const tablePhoneNumbers = SQL_TABLES.PHONE_NUMBERS;
const tablePhonePrefixes = SQL_TABLES.PHONE_PREFIXES;
const tableDeals = SQL_TABLES.DEALS;
const tableDealsStatuses = SQL_TABLES.DEAL_STATUSES;
const tableDealsStatusesHistory = SQL_TABLES.DEAL_HISTORY_STATUSES;
const tableCargos = SQL_TABLES.CARGOS;

const cols = table.COLUMNS;
const colsUsers = tableUsers.COLUMNS;
const colsUsersCompanies = tableUsersCompanies.COLUMNS;
const colsPhoneNumbers = tablePhoneNumbers.COLUMNS;
const colsPhonePrefixes = tablePhonePrefixes.COLUMNS;
const colsDeals = tableDeals.COLUMNS;
const colsDealsStatuses = tableDealsStatuses.COLUMNS;
const colsDealsStatusesHistory = tableDealsStatusesHistory.COLUMNS;
const colsCargos = tableCargos.COLUMNS;

const insertRecord = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFields(values)
    .returning('*')
    .toString();

const insertRecords = values => squelPostgres
    .insert()
    .into(table.NAME)
    .setFieldsRows(values)
    .returning('*')
    .toString();

const updateRecordByUserId = (userId, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`${cols.USER_ID} = '${userId}'`)
    .returning('*')
    .toString();

const updateRecord = (id, values) => squelPostgres
    .update()
    .table(table.NAME)
    .setFields(values)
    .where(`id = '${id}'`)
    .returning('*')
    .toString();

const selectRecordByUserId = userId => squelPostgres
    .select()
    .from(table.NAME)
    .where(`${cols.USER_ID} = '${userId}'`)
    .toString();

const selectRecordById = id => squelPostgres
    .select()
    .from(table.NAME)
    .where(`id = '${id}'`)
    .toString();

const selectAvailableDriversPaginationSorting = (companyId, cargoDates, limit, offset, sortColumn, asc, filter) => {
    let expression = squelPostgres
        .select()
        .field('d.id', HOMELESS_COLUMNS.DRIVER_ID)
        .field('u.*')
        .field(`CONCAT(php.${colsPhonePrefixes.CODE}, phn.${colsPhoneNumbers.NUMBER})::bigint`, HOMELESS_COLUMNS.FULL_PHONE_NUMBER)
        .field('php.id', HOMELESS_COLUMNS.PHONE_PREFIX_ID)
        .field(`phn.${colsPhoneNumbers.NUMBER}`, HOMELESS_COLUMNS.PHONE_NUMBER)
        .from(table.NAME, 'd');

    setAvailableDriversForDealFilter(expression, cargoDates, companyId);

    expression = setAvailableDriversFilter(expression, filter);
    return expression
        .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
        .left_join(tableUsersCompanies.NAME, 'uc', `uc.${colsUsersCompanies.USER_ID} = u.id`)
        .left_join(tablePhoneNumbers.NAME, 'phn', `phn.${colsPhoneNumbers.USER_ID} = u.id`)
        .left_join(tablePhonePrefixes.NAME, 'php', `php.id = phn.${colsPhoneNumbers.PHONE_PREFIX_ID}`)

        .order(sortColumn, asc)
        .limit(limit)
        .offset(offset)
        .toString();
};

const setAvailableDriversForDealFilter = (expression, cargoDates, companyId) => {
    const {
        upFrom, upTo, downTo
    } = cargoDates;
    expression
        .where('d.id in ?', squelPostgres
            .select()
            .field('DISTINCT(d2.id)')
            .from(table.NAME, 'd2')
            .where(`uc.${colsUsersCompanies.COMPANY_ID} = '${companyId}'`)
            .where(`u.${colsUsers.FREEZED} = 'f'`)
            .where('dsh.id IS NULL OR dsh.id = ?', squelPostgres
                .select()
                .field('hdsh.id')
                .from(tableDealsStatusesHistory.NAME, 'hdsh')
                .where(`hdsh.${colsDealsStatusesHistory.DEAL_ID} = de.id`)
                .order(colsDealsStatusesHistory.CREATED_AT, false)
                .limit(1)
            )
            .where(`dsh.id IS NULL OR dsh.${colsDealsStatusesHistory.DEAL_STATUS_ID} IN ? OR
                (
                    CASE
                        WHEN c.${colsCargos.UPLOADING_DATE_FROM} > '${upFrom}' THEN (
                            (c.${colsCargos.UPLOADING_DATE_TO} IS NOT NULL AND '${downTo}' < c.${colsCargos.UPLOADING_DATE_TO}) OR
                            (c.${colsCargos.UPLOADING_DATE_TO} IS NULL AND '${downTo}' < c.${colsCargos.DOWNLOADING_DATE_TO})
                        )
                        ELSE (
                            ${upTo ? `c.${colsCargos.DOWNLOADING_DATE_TO} < '${upTo}'` : `c.${colsCargos.DOWNLOADING_DATE_TO} < '${downTo}'`}
                        )
                    END
                )`, squelPostgres
                .select()
                .field('ds.id')
                .from(tableDealsStatuses.NAME, 'ds')
                .where(`ds.${colsDealsStatuses.NAME} IN ?`, ['finished'])
            )
            .left_join(tableDeals.NAME, 'de', `de.${colsDeals.DRIVER_ID} = d2.id`)
            .left_join(tableDealsStatusesHistory.NAME, 'dsh', `dsh.${colsDealsStatusesHistory.DEAL_ID} = de.id`)
            .left_join(tableCargos.NAME, 'c', `c.id = de.${colsDeals.CARGO_ID}`)
        );
};

const selectCountAvailableDrivers = (companyId, cargoDates, filter) => {
    let expression = squelPostgres
        .select()
        .field('COUNT(d.id)')
        .from(table.NAME, 'd');

    setAvailableDriversForDealFilter(expression, cargoDates, companyId);

    expression = setAvailableDriversFilter(expression, filter);
    return expression
        .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
        .left_join(tableUsersCompanies.NAME, 'uc', `uc.${colsUsersCompanies.USER_ID} = u.id`)
        .toString();
};

const setAvailableDriversFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.FULL_NAME, `u.${colsUsers.FULL_NAME}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.FULL_NAME]}%'`],
    ];

    for (let [key, exp] of filteringObjectSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

const selectRecordByCompanyIdLight = companyId => squelPostgres
    .select()
    .field('d.id')
    .from(table.NAME, 'd')
    .where(`uc.${colsUsersCompanies.COMPANY_ID} = '${companyId}'`)
    .where(`u.${colsUsers.FREEZED} = 'f'`)
    .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
    .left_join(tableUsersCompanies.NAME, 'uc', `uc.${colsUsersCompanies.USER_ID} = u.id`)
    .toString();

const selectAvailableDriversByIdsAndCompanyId = (ids, companyId) => squelPostgres // todo: check full availability
    .select()
    .field('d.*')
    .from(table.NAME, 'd')
    .where(`uc.${colsUsersCompanies.COMPANY_ID} = '${companyId}'`)
    .where(`u.${colsUsers.FREEZED} = 'f'`)
    .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
    .left_join(tableUsersCompanies.NAME, 'uc', `uc.${colsUsersCompanies.USER_ID} = u.id`)
    .toString();

const selectAvailableDriverByIdAndCompanyId = (id, companyId, cargoDates) => {
    let expression = squelPostgres
        .select()
        .field('d.*')
        .from(table.NAME, 'd');

    setAvailableDriversForDealFilter(expression, cargoDates, companyId);

    return expression
        .where(`d.id = '${id}'`)
        .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
        .left_join(tableUsersCompanies.NAME, 'uc', `uc.${colsUsersCompanies.USER_ID} = u.id`)
        .toString();
};

const selectDriversByPhoneNumbers = numbers => squelPostgres
    .select()
    .from(table.NAME, 'd')
    .where(`CONCAT(php.${colsPhonePrefixes.CODE}, phn.${colsPhoneNumbers.NUMBER}) IN ?`, numbers)
    .left_join(tableUsers.NAME, 'u', `u.id = d.${cols.USER_ID}`)
    .left_join(tablePhoneNumbers.NAME, 'phn', `phn.${colsPhoneNumbers.USER_ID} = u.id`)
    .left_join(tablePhonePrefixes.NAME, 'php', `php.id = phn.${colsPhoneNumbers.PHONE_PREFIX_ID}`)
    .toString();

module.exports = {
    insertRecord,
    insertRecords,
    updateRecordByUserId,
    updateRecord,
    selectRecordByUserId,
    selectRecordById,
    selectAvailableDriversPaginationSorting,
    selectCountAvailableDrivers,
    selectRecordByCompanyIdLight,
    selectAvailableDriversByIdsAndCompanyId,
    selectAvailableDriverByIdAndCompanyId,
    selectDriversByPhoneNumbers,
};
