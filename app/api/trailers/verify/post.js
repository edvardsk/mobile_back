const { success, reject } = require('api/response');

// services
const TrailersService = require('services/tables/trailers');
const DraftTrailersService = require('services/tables/draft-trailers');
const DraftTrailersFilesService = require('services/tables/draft-trailers-to-files');
const FilesService = require('services/tables/files');
const TrailersFilesService = require('services/tables/trailers-to-files');
const DraftFilesService = require('services/tables/draft-files');
const DangerClassesService = require('services/tables/danger-classes');
const TrailersStateNumbersService = require('services/tables/trailers-state-numbers');
const TablesService = require('services/tables');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { DOCUMENTS } = require('constants/files');

// formatters
const TrailersFormatters = require('formatters/trailers');
const FilesFormatters = require('formatters/files');

// helpers
const { isDangerous } = require('helpers/danger-classes');

const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;
const colsDraftTrailers = SQL_TABLES.DRAFT_TRAILERS.COLUMNS;
const colsDangerClasses = SQL_TABLES.DANGER_CLASSES.COLUMNS;
const colsTrailersStateNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS.COLUMNS;

const verifyTrailer = async (req, res, next) => {
    try {
        const { trailerId } = req.params;

        const [trailer, draftTrailer] = await Promise.all([
            TrailersService.getRecordStrict(trailerId),
            DraftTrailersService.getRecordByTrailerId(trailerId),
        ]);

        if (trailer[colsTrailers.VERIFIED] && !trailer[colsTrailers.SHADOW] && !draftTrailer) {
            return reject(res, ERRORS.VERIFY.ALREADY_VERIFIED);
        }

        const transactionsList = [];
        let urlsToDelete = [];
        let trailerData = {};
        if (!trailer[colsTrailers.VERIFIED]) {
            trailerData = TrailersFormatters.formatRecordAsVerified();
        }

        if (draftTrailer) {
            trailerData = {
                ...trailerData,
                ...TrailersFormatters.formatRecordToUpdateFromDraft(draftTrailer),
                ...TrailersFormatters.formatRecordAsNotShadow(),
            };

            const draftFiles = await DraftFilesService.getFilesByDraftTrailerId(draftTrailer.id);
            if (draftFiles.length) {
                const basicDraftLabels = FilesFormatters.formatBasicFileLabels(draftFiles);
                const filesToDelete = await FilesService.getFilesByTrailerIdAndArrayLabels(trailerId, basicDraftLabels);

                if (filesToDelete.length) {
                    const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);
                    urlsToDelete = [...urls];

                    transactionsList.push(
                        TrailersFilesService.removeRecordsByFileIdsAsTransaction(ids)
                    );
                    transactionsList.push(
                        FilesService.removeFilesByIdsAsTransaction(ids)
                    );
                }
                const [dbFiles, dbTrailersFiles] = FilesFormatters.prepareFilesToStoreForTrailersFromDraft(draftFiles, trailerId);
                transactionsList.push(
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    TrailersFilesService.addRecordsAsTransaction(dbTrailersFiles)
                );

                const draftFilesIds = draftFiles.map(file => file.id);
                transactionsList.push(
                    DraftTrailersFilesService.removeRecordsByFileIdsAsTransaction(draftFilesIds)
                );
                transactionsList.push(
                    DraftFilesService.removeFilesByIdsAsTransaction(draftFilesIds)
                );
            }

            const newDangerClassId = draftTrailer[colsDraftTrailers.TRAILER_DANGER_CLASS_ID];
            const oldDangerClassId = trailer[colsTrailers.TRAILER_DANGER_CLASS_ID];

            const [oldDangerClass, newDangerClass] = await Promise.all([
                oldDangerClassId && DangerClassesService.getRecord(oldDangerClassId),
                DangerClassesService.getRecord(newDangerClassId),
            ]);

            const oldDangerClassName = oldDangerClass && oldDangerClass[colsDangerClasses.NAME];
            const newDangerClassName = newDangerClass[colsDangerClasses.NAME];

            if (!trailer[colsTrailers.SHADOW] && isDangerous(oldDangerClassName) && !isDangerous(newDangerClassName)) { // remove old file with danger class
                const filesToDelete = await FilesService.getFilesByTrailerIdAndLabels(trailerId, [DOCUMENTS.DANGER_CLASS]);

                if (filesToDelete.length) {
                    const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                    transactionsList.push(
                        TrailersFilesService.removeRecordsByFileIdsAsTransaction(ids)
                    );
                    transactionsList.push(
                        FilesService.removeFilesByIdsAsTransaction(ids)
                    );

                    urlsToDelete = [
                        ...urlsToDelete,
                        ...urls,
                    ];
                }
            }

            const oldStateNumber = trailer[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER];
            const newStateNumber = draftTrailer[colsDraftTrailers.TRAILER_STATE_NUMBER];

            if (oldStateNumber !== newStateNumber) {
                transactionsList.push(
                    TrailersStateNumbersService.editActiveRecordsByTrailerIdAsTransaction(trailerId, {
                        [colsTrailersStateNumbers.IS_ACTIVE]: false,
                    })
                );

                const trailerStateNumberData = {
                    [colsTrailersStateNumbers.TRAILER_ID]: trailerId,
                    [colsTrailersStateNumbers.NUMBER]: newStateNumber,
                };

                transactionsList.push(
                    TrailersStateNumbersService.addRecordAsTransaction(trailerStateNumberData)
                );
            }

            transactionsList.push(
                DraftTrailersService.removeRecordAsTransaction(draftTrailer.id)
            );
        }

        transactionsList.push(
            TrailersService.editRecordAsTransaction(trailerId, trailerData)
        );

        await TablesService.runTransaction(transactionsList);

        if (urlsToDelete.length) {
            await Promise.all(urlsToDelete.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));
        }

        return success(res, { trailerId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyTrailer,
};
