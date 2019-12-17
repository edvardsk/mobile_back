const { get } = require('lodash');
const squel = require('squel');

const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

const squelPostgres = squel.useFlavour('postgres');

const tnvedCodesTable = SQL_TABLES.TNVED_CODES;

const tnvedCodesKeywordsTable = SQL_TABLES.TNVED_CODES_KEYWORDS;
const tnvedCodesKeywordsColumns = tnvedCodesKeywordsTable.COLUMNS;

const selectRecords = () => squelPostgres
    .select()
    .from(tnvedCodesTable.NAME)
    .toString();

const selectRecordsByLanguageAndKeyword = (languageId, filter) => {
    let expression = squelPostgres
        .select()
        .from(tnvedCodesTable.NAME, 'c')
        .field('c.*')
        .left_join(tnvedCodesKeywordsTable.NAME, 'k', `c.id = k.${tnvedCodesKeywordsColumns.TNVED_CODE_ID}`)
        .group('c.id')
        .where(`k.${tnvedCodesKeywordsColumns.LANGUAGE_ID} = '${languageId}'`);

    setMatchingCodesFilter(expression, filter);

    return expression
        .toString();
};

const setMatchingCodesFilter = (expression, filteringObject) => {
    const filteringObjectSQLExpressions = [
        [HOMELESS_COLUMNS.KEYWORD, `k.${tnvedCodesKeywordsColumns.VALUE}::text ILIKE '%${filteringObject[HOMELESS_COLUMNS.KEYWORD]}%'`],
    ];

    for (let [key, exp] of filteringObjectSQLExpressions) {
        if (get(filteringObject, key) !== undefined) {
            expression = expression.where(exp);
        }
    }
    return expression;
};

module.exports = {
    selectRecords,
    selectRecordsByLanguageAndKeyword,
};
