const { intersection } = require('lodash');
const uuid = require('uuid/v4');

const { success } = require('api/response');

// services
const TrailersService = require('services/tables/trailers');
const DraftTrailersService = require('services/tables/draft-trailers');
const DraftTrailersFilesService = require('services/tables/draft-trailers-to-files');
const TrailersStateNumbersService = require('services/tables/trailers-state-numbers');
const FilesService = require('services/tables/files');
const DraftFilesService = require('services/tables/draft-files');
const TrailersFilesService = require('services/tables/trailers-to-files');
const DangerClassesService = require('services/tables/danger-classes');
const TablesService = require('services/tables/index');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');

// formatters
const TrailersFormatters = require('formatters/trailers');
const DraftTrailersFormatters = require('formatters/draft-trailers');
const FilesFormatters = require('formatters/files');

// helpers
const { isDangerous } = require('helpers/danger-classes');

const colsTrailers = SQL_TABLES.TRAILERS.COLUMNS;
const colsDraftTrailers = SQL_TABLES.DRAFT_TRAILERS.COLUMNS;
const colsTrailersNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS.COLUMNS;
const colsDangerClasses = SQL_TABLES.DANGER_CLASSES.COLUMNS;

const editTrailer = async (req, res, next) => {
    try {
        const { body, files } = req;
        const { trailerId } = req.params;
        const { isControlRole } = res.locals;

        const stateNumber = body[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER].toUpperCase();
        const currentStateNumberRecord = await TrailersStateNumbersService.getActiveRecordByTrailerIdStrict(trailerId);
        const currentStateNumber = currentStateNumberRecord[colsTrailersNumbers.NUMBER];

        let transactionsList = [];
        let filesToStore = [];
        let urlsToDelete = [];

        const trailersRequiredDocuments = [DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION, DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT, DOCUMENTS.VEHICLE_PHOTO];
        const passedFiles = Object.keys(files);
        const fileLabelsToDelete = intersection(trailersRequiredDocuments, passedFiles);

        if (isControlRole) {
            const trailerData = TrailersFormatters.formatTrailerToEdit(body);

            transactionsList.push(
                TrailersService.editRecordAsTransaction(trailerId, TrailersFormatters.formatRecordAsNotShadow(trailerData))
            );

            const trailerFromDb = await TrailersService.getRecordStrict(trailerId);

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

                    urlsToDelete = [
                        ...urlsToDelete,
                        ...urls,
                    ];
                }
                const filesToStoreObject = {};
                Object.keys(files).forEach(fileName => {
                    if (trailersRequiredDocuments.includes(fileName)) {
                        filesToStoreObject[fileName] = files[fileName];
                    }
                });
                const [dbFiles, dbTrailersFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForTrailers(filesToStoreObject, trailerId);

                filesToStore = [
                    ...filesToStore,
                    ...storageFiles,
                ];

                transactionsList.push(
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    TrailersFilesService.addRecordsAsTransaction(dbTrailersFiles)
                );
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
                dangerClassIdFromDb && DangerClassesService.getRecord(dangerClassIdFromDb),
                DangerClassesService.getRecord(dangerClassId),
            ]);

            const oldDangerClassName = oldDangerClass && oldDangerClass[colsDangerClasses.NAME];
            const newDangerClassName = newDangerClass[colsDangerClasses.NAME];

            if (!trailerFromDb[colsTrailers.SHADOW] && (
                isDangerous(oldDangerClassName) && !isDangerous(newDangerClassName)
            )) { // remove old file with danger class
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

                filesToStore = [
                    ...filesToStore,
                    ...storageFiles,
                ];
            }

        } else {
            let newDraftTrailerId;

            const draftTrailer = await DraftTrailersService.getRecordByTrailerId(trailerId);
            if (draftTrailer) {
                const draftTrailerData = DraftTrailersFormatters.formatRecordToEdit(body);
                transactionsList.push(
                    DraftTrailersService.editRecordAsTransaction(draftTrailer.id, draftTrailerData)
                );
            } else {
                newDraftTrailerId = uuid();
                const draftTrailerData = DraftTrailersFormatters.formatRecordToSave(newDraftTrailerId, trailerId, body);
                transactionsList.push(
                    DraftTrailersService.addRecordAsTransaction(draftTrailerData)
                );
            }

            if (Object.keys(files).length) {
                if (fileLabelsToDelete.length) {
                    const filesToDelete = await DraftFilesService.getFilesByTrailerIdAndLabels(trailerId, fileLabelsToDelete);

                    if (filesToDelete.length) {
                        const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                        transactionsList.push(
                            DraftTrailersFilesService.removeRecordsByFileIdsAsTransaction(ids)
                        );
                        transactionsList.push(
                            DraftFilesService.removeFilesByIdsAsTransaction(ids)
                        );

                        urlsToDelete = [
                            ...urlsToDelete,
                            ...urls,
                        ];
                    }
                }

                const filesToStoreObject = {};
                Object.keys(files).forEach(fileName => {
                    if (trailersRequiredDocuments.includes(fileName)) {
                        filesToStoreObject[fileName] = files[fileName];
                    }
                });

                if (files[DOCUMENTS.DANGER_CLASS]) { // add new version of danger class
                    filesToStoreObject[DOCUMENTS.DANGER_CLASS] = files[DOCUMENTS.DANGER_CLASS];
                }

                const [
                    dbFiles, dbTrailersFiles, storageFiles
                ] = FilesFormatters.prepareFilesToStoreForDraftTrailers(filesToStoreObject, newDraftTrailerId || draftTrailer.id);

                filesToStore = [
                    ...filesToStore,
                    ...storageFiles,
                ];

                transactionsList.push(
                    DraftFilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    DraftTrailersFilesService.addRecordsAsTransaction(dbTrailersFiles)
                );
            }

            if (draftTrailer) { // check files to remove
                const newDangerClassId = body[colsTrailers.TRAILER_DANGER_CLASS_ID];
                const draftDangerClassId = draftTrailer[colsDraftTrailers.TRAILER_DANGER_CLASS_ID];

                const [oldDangerClass, newDangerClass] = await Promise.all([
                    DangerClassesService.getRecord(draftDangerClassId),
                    DangerClassesService.getRecord(newDangerClassId),
                ]);

                const oldDangerClassName = oldDangerClass[colsDangerClasses.NAME];
                const newDangerClassName = newDangerClass[colsDangerClasses.NAME];

                const dangerClassFile = files[DOCUMENTS.DANGER_CLASS];

                if (
                    (isDangerous(oldDangerClassName) && !isDangerous(newDangerClassName)) ||
                    dangerClassFile
                ) { // remove old file with danger class
                    const filesToDelete = await DraftFilesService.getFilesByTrailerIdAndLabels(trailerId, [DOCUMENTS.DANGER_CLASS]);

                    if (filesToDelete.length) {
                        const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                        transactionsList.push(
                            DraftTrailersFilesService.removeRecordsByFileIdsAsTransaction(ids)
                        );
                        transactionsList.push(
                            DraftFilesService.removeFilesByIdsAsTransaction(ids)
                        );

                        urlsToDelete = [
                            ...urlsToDelete,
                            ...urls,
                        ];
                    }
                }
            }
        }

        await TablesService.runTransaction(transactionsList);

        if (urlsToDelete.length) {
            await Promise.all(urlsToDelete.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));
        }

        if (filesToStore.length) {
            await Promise.all(filesToStore.map(({ bucket, path, data, contentType }) => {
                return S3Service.putObject(bucket, path, data, contentType);
            }));
        }

        return success(res, { id: trailerId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editTrailer,
};
