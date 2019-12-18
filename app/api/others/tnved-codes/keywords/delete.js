const { success } = require('api/response');

// services
const TNVEDCodesKeywordsService = require('services/tables/tnved-codes-keywords');

const deleteTNVEDCodesKeywordById = async (req, res, next) => {
    try {
        const { keywordId } = req.params;
        const keyword = await TNVEDCodesKeywordsService.removeRecordByKeywordId(keywordId);
        return success(res, { id: keyword.id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    deleteTNVEDCodesKeywordById,
};
