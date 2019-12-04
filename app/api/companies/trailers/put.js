const { intersection } = require('lodash');
const { success } = require('api/response');

// services
const TrailersServices = require('services/tables/trailers');
const TrailersStateNumbersService = require('services/tables/trailers-state-numbers');
const FilesService = require('services/tables/files');
const TrailersFilesService = require('services/tables/trailers-to-files');
const DangerClassesService = require('services/tables/danger-classes');
const TablesService = require('services/tables/index');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');

// formatters
const TrailersFormatters = require('formatters/trailers');
const FilesFormatters = require('formatters/files');

// helpers
const { isDangerous } = require('helpers/danger-classes');

const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;
const colsTrailersNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS.COLUMNS;
const colsDangerClasses = SQL_TABLES.DANGER_CLASSES.COLUMNS;

const editTrailer = async (req, res, next) => {
    try {
        const { body, files } = req;
        const { trailerId } = req.params;
        const stateNumber = body[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER];
        const currentStateNumberRecord = await TrailersStateNumbersService.getActiveRecordByTrailerIdStrict(trailerId);
        const currentStateNumber = currentStateNumberRecord[colsTrailersNumbers.NUMBER];
        const trailerData = TrailersFormatters.formatTrailerToEdit(body);

        const transactionsList = [
            TrailersServices.editRecordAsTransaction(trailerId, trailerData)
        ];

        const trailerRequiredDocuments = [DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION, DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT];
        const passedFiles = Object.keys(files);
        const fileLabelsToDelete = intersection(trailerRequiredDocuments, passedFiles);

        const trailerFromDb = await TrailersServices.getRecordStrict(trailerId);

        if (fileLabelsToDelete.length) {
            const filesToDelete = await FilesService.getFilesByCarIdAndLabels(trailerId, fileLabelsToDelete);
            if (filesToDelete.length) {
                const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                transactionsList.push(
                    TrailersFilesService.removeRecordsByFileIdsAsTransaction(ids)
                );
                transactionsList.push(
                    FilesService.removeFilesByIdsAsTransaction(ids)
                );

                await Promise.all(urls.map(url => {
                    const [bucket, path] = url.split('/');
                    return S3Service.deleteObject(bucket, path);
                }));

                const filesToStore = {};
                Object.keys(files).forEach(fileName => {
                    if (trailerRequiredDocuments.includes(fileName)) {
                        filesToStore[fileName] = files[fileName];
                    }
                });
                const [dbFiles, dbTrailersFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForTrailers(filesToStore, trailerId);

                transactionsList.push(
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    TrailersFilesService.addRecordsAsTransaction(dbTrailersFiles)
                );

                await Promise.all(storageFiles.map(({ bucket, path, data, contentType }) => {
                    return S3Service.putObject(bucket, path, data, contentType);
                }));
            }
        }

        if (stateNumber !== currentStateNumber) {
            transactionsList.push(
                TrailersStateNumbersService.editActiveRecordsByTrailerIdAsTransaction(trailerId, {
                    [colsTrailersNumbers.IS_ACTIVE]: false,
                })
            );

            const trailerStateNumberData = {
                [colsTrailersNumbers.TRAILER_ID]: trailerId,
                [colsTrailersNumbers.NUMBER]: stateNumber,
            };

            transactionsList.push(
                TrailersStateNumbersService.addRecordAsTransaction(trailerStateNumberData)
            );
        }

        const dangerClassId = body[colsTrailers.TRAILER_DANGER_CLASS_ID];
        const dangerClassIdFromDb = trailerFromDb[colsTrailers.TRAILER_DANGER_CLASS_ID];

        const [oldDangerClass, newDangerClass] = await Promise.all([
            DangerClassesService.getRecord(dangerClassIdFromDb),
            DangerClassesService.getRecord(dangerClassId),
        ]);

        const oldDangerClassName = oldDangerClass[colsDangerClasses.NAME];
        const newDangerClassName = newDangerClass[colsDangerClasses.NAME];

        if (isDangerous(oldDangerClassName) && !isDangerous(newDangerClassName)) { // remove old file with danger class
            const filesToDelete = await FilesService.getFilesByTrailerIdAndLabels(trailerId, [DOCUMENTS.DANGER_CLASS]);

            const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

            transactionsList.push(
                TrailersFilesService.removeRecordsByFileIdsAsTransaction(ids)
            );
            transactionsList.push(
                FilesService.removeFilesByIdsAsTransaction(ids)
            );

            await Promise.all(urls.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));
        }
        if (files[DOCUMENTS.DANGER_CLASS]) { // add new version of danger class
            const [dbFiles, dbTrailersFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForTrailers({
                [DOCUMENTS.DANGER_CLASS]: files[DOCUMENTS.DANGER_CLASS],
            }, trailerId);

            transactionsList.push(
                FilesService.addFilesAsTransaction(dbFiles)
            );
            transactionsList.push(
                TrailersFilesService.addRecordsAsTransaction(dbTrailersFiles)
            );

            await Promise.all(storageFiles.map(({ bucket, path, data, contentType }) => {
                return S3Service.putObject(bucket, path, data, contentType);
            }));
        }

        await TablesService.runTransaction(transactionsList);

        return success(res, { id: trailerId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editTrailer,
};
