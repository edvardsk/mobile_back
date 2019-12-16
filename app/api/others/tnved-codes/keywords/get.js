const { success } = require('api/response');

// services
const TNVEDCodesKeywordsService = require('services/tables/tnved-codes-keywords');

// constants
const { SQL_TABLES } = require('constants/tables');

const cols = SQL_TABLES.TNVED_CODES_KEYWORDS.COLUMNS;

const getKeywordsByTNVEDCodeId = async (req, res, next) => {
    try {
        const { query } = req;
        const tnvedCodeId = query[cols.TNVED_CODE_ID];

        const keywords = await TNVEDCodesKeywordsService.getRecordsByTNVEDId(tnvedCodeId);
        return success(res, { keywords });
    } catch (error) {
        next(error);
    }
};

const getAllKeywords = async (req, res, next) => {
    try {
        const keywords = await TNVEDCodesKeywordsService.getRecords();
        return success(res, { keywords });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllKeywords,
    getKeywordsByTNVEDCodeId,
};
