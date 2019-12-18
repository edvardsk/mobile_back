const { success } = require('api/response');

// services
const TablesService = require('services/tables');
const TNVEDCodesKeywords = require('services/tables/tnved-codes-keywords');

// formatters
const { formatTNVEDKeywordToSave } = require('formatters/tnved-codes-keywords');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');

const addKeyword = async (req, res, next) => {
    try {
        const { body } = req;
        const record = formatTNVEDKeywordToSave(body);

        await TablesService.runTransaction([
            TNVEDCodesKeywords.addRecordAsTransaction(record),
        ]);

        return success(res, {}, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addKeyword,
};
