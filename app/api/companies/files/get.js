const { success } = require('api/response');

// services
const FilesService = require('services/tables/files');

const getGroupFiles = async (req, res, next) => {
    try {
        const { company } = res.locals;

        const { fileGroup } = req.params;

        const files = await FilesService.getFilesByCompanyIdAndFileGroup(company.id, fileGroup);

        const resultFiles = await FilesService.formatTemporaryLinks(files);

        return success(res, { files: resultFiles } );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getGroupFiles,
};
