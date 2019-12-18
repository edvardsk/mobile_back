const { success } = require('api/response');

// services
const TNVEDCodesKeywordsService = require('services/tables/tnved-codes-keywords');

// formatters
const { formatTNVEDKeywordToSave } = require('formatters/tnved-codes-keywords');

const editTNVEDCodesKeywordById = async (req, res, next) => {
    try {
        const { body } = req;
        const { keywordId } = req.params;
        const keywordData = formatTNVEDKeywordToSave(body);
        const record = await TNVEDCodesKeywordsService.editRecordByKeywordId(keywordId, keywordData);
        return success(res, { id: record.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editTNVEDCodesKeywordById,
};
