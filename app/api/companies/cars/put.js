const { intersection } = require('lodash');
const uuid = require('uuid/v4');

const { success } = require('api/response');

// services
const CarsServices = require('services/tables/cars');
const DraftCarsServices = require('services/tables/draft-cars');
const CarsStateNumbersService = require('services/tables/cars-state-numbers');
const FilesService = require('services/tables/files');
const DraftFilesService = require('services/tables/draft-files');
const CarsFilesService = require('services/tables/cars-to-files');
const DraftCarsFilesService = require('services/tables/draft-cars-to-files');
const DangerClassesService = require('services/tables/danger-classes');
const TablesService = require('services/tables/index');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { CAR_TYPES_MAP } = require('constants/cars');
const { DOCUMENTS } = require('constants/files');

// formatters
const CarsFormatters = require('formatters/cars');
const FilesFormatters = require('formatters/files');
const DraftCarsFormatters = require('formatters/draft-cars');

// helpers
const { isDangerous } = require('helpers/danger-classes');

const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsDraftCars = SQL_TABLES.DRAFT_CARS.COLUMNS;
const colsCarsNumbers = SQL_TABLES.CARS_STATE_NUMBERS.COLUMNS;
const colsDangerClasses = SQL_TABLES.DANGER_CLASSES.COLUMNS;

const editCar = async (req, res, next) => {
    try {
        const { body, files } = req;
        const { carId } = req.params;
        const { isControlRole } = res.locals;

        const newCarType = body[colsCars.CAR_TYPE];
        const stateNumber = body[HOMELESS_COLUMNS.CAR_STATE_NUMBER].toUpperCase();
        const currentStateNumberRecord = await CarsStateNumbersService.getActiveRecordByCarIdStrict(carId);
        const currentStateNumber = currentStateNumberRecord[colsCarsNumbers.NUMBER];

        let transactionsList = [];
        let filesToStore = [];
        let urlsToDelete = [];

        const carRequiredDocuments = [DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION, DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT, DOCUMENTS.VEHICLE_PHOTO];
        const passedFiles = Object.keys(files);
        const fileLabelsToDelete = intersection(carRequiredDocuments, passedFiles);

        if (isControlRole) {
            const carData = CarsFormatters.formatCarToEdit(body);

            transactionsList = [
                CarsServices.editRecordAsTransaction(carId, carData)
            ];

            const carFromDb = await CarsServices.getRecordStrict(carId);
            const oldCarType = carFromDb[colsCars.CAR_TYPE];

            if (fileLabelsToDelete.length) {
                const filesToDelete = await FilesService.getFilesByCarIdAndLabels(carId, fileLabelsToDelete);

                if (filesToDelete.length) {
                    const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                    transactionsList.push(
                        CarsFilesService.removeRecordsByFileIdsAsTransaction(ids)
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
                    if (carRequiredDocuments.includes(fileName)) {
                        filesToStoreObject[fileName] = files[fileName];
                    }
                });
                const [dbFiles, dbCarsFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForCars(filesToStoreObject, carId);

                filesToStore = [
                    ...filesToStore,
                    ...storageFiles,
                ];

                transactionsList.push(
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    CarsFilesService.addRecordsAsTransaction(dbCarsFiles)
                );
            }

            if (stateNumber !== currentStateNumber) {
                transactionsList.push(
                    CarsStateNumbersService.editActiveRecordsByCarIdAsTransaction(carId, {
                        [colsCarsNumbers.IS_ACTIVE]: false,
                    })
                );

                const carStateNumberData = {
                    [colsCarsNumbers.CAR_ID]: carId,
                    [colsCarsNumbers.NUMBER]: stateNumber,
                };

                transactionsList.push(
                    CarsStateNumbersService.addRecordAsTransaction(carStateNumberData)
                );
            }

            const dangerClassId = body[colsCars.CAR_DANGER_CLASS_ID];
            const dangerClassIdFromDb = carFromDb[colsCars.CAR_DANGER_CLASS_ID];

            const [oldDangerClass, newDangerClass] = await Promise.all([
                dangerClassIdFromDb && DangerClassesService.getRecord(dangerClassIdFromDb),
                dangerClassId && DangerClassesService.getRecord(dangerClassId),
            ]);

            const oldDangerClassName = oldDangerClass && oldDangerClass[colsDangerClasses.NAME];
            const newDangerClassName = newDangerClass && newDangerClass[colsDangerClasses.NAME];

            if (
                (newCarType === CAR_TYPES_MAP.QUAD && oldCarType === CAR_TYPES_MAP.TRUCK) ||
                (oldCarType === CAR_TYPES_MAP.TRUCK && isDangerous(oldDangerClassName) && !isDangerous(newDangerClassName))
            ) { // remove old file with danger class
                const filesToDelete = await FilesService.getFilesByCarIdAndLabels(carId, [DOCUMENTS.DANGER_CLASS]);

                if (filesToDelete.length) {
                    const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                    transactionsList.push(
                        CarsFilesService.removeRecordsByFileIdsAsTransaction(ids)
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
                const [dbFiles, dbCarsFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForCars({
                    [DOCUMENTS.DANGER_CLASS]: files[DOCUMENTS.DANGER_CLASS],
                }, carId);

                transactionsList.push(
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    CarsFilesService.addRecordsAsTransaction(dbCarsFiles)
                );

                filesToStore = [
                    ...filesToStore,
                    ...storageFiles,
                ];
            }
        } else {
            let newDraftCarId;

            const draftCar = await DraftCarsServices.getRecordByCarId(carId);
            if (draftCar) {
                const draftCarData = DraftCarsFormatters.formatRecordToEdit(body);
                transactionsList.push(
                    DraftCarsServices.editRecordAsTransaction(draftCar.id, draftCarData)
                );
            } else {
                newDraftCarId = uuid();
                const draftCarData = DraftCarsFormatters.formatRecordToSave(newDraftCarId, carId, body);
                transactionsList.push(
                    DraftCarsServices.addRecordAsTransaction(draftCarData)
                );
            }

            if (Object.keys(files).length) {
                if (fileLabelsToDelete.length) {
                    const filesToDelete = await DraftFilesService.getFilesByCarIdAndLabels(carId, fileLabelsToDelete);

                    if (filesToDelete.length) {
                        const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                        transactionsList.push(
                            DraftCarsFilesService.removeRecordsByFileIdsAsTransaction(ids)
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
                    if (carRequiredDocuments.includes(fileName)) {
                        filesToStoreObject[fileName] = files[fileName];
                    }
                });

                if (files[DOCUMENTS.DANGER_CLASS]) { // add new version of danger class
                    filesToStoreObject[DOCUMENTS.DANGER_CLASS] = files[DOCUMENTS.DANGER_CLASS];
                }

                const [dbFiles, dbCarsFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForDraftCars(filesToStoreObject, newDraftCarId || draftCar.id);

                filesToStore = [
                    ...filesToStore,
                    ...storageFiles,
                ];

                transactionsList.push(
                    DraftFilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    DraftCarsFilesService.addRecordsAsTransaction(dbCarsFiles)
                );
            }

            if (draftCar) { // check files to remove
                const newDangerClassId = body[colsCars.CAR_DANGER_CLASS_ID];
                const draftDangerClassId = draftCar[colsDraftCars.CAR_DANGER_CLASS_ID];
                const draftCarType = draftCar[colsDraftCars.CAR_TYPE];

                const [oldDangerClass, newDangerClass] = await Promise.all([
                    draftDangerClassId && DangerClassesService.getRecord(draftDangerClassId),
                    newDangerClassId && DangerClassesService.getRecord(newDangerClassId),
                ]);

                const oldDangerClassName = oldDangerClass && oldDangerClass[colsDangerClasses.NAME];
                const newDangerClassName = newDangerClass && newDangerClass[colsDangerClasses.NAME];

                if (
                    (newCarType === CAR_TYPES_MAP.QUAD && draftCarType === CAR_TYPES_MAP.TRUCK) ||
                    (draftCarType === CAR_TYPES_MAP.TRUCK && isDangerous(oldDangerClassName) && newCarType === CAR_TYPES_MAP.TRUCK && !isDangerous(newDangerClassName)) ||
                    (draftCarType === CAR_TYPES_MAP.TRUCK && isDangerous(oldDangerClassName) && files[DOCUMENTS.DANGER_CLASS])
                ) { // remove old file with danger class
                    const filesToDelete = await DraftFilesService.getFilesByCarIdAndLabels(carId, [DOCUMENTS.DANGER_CLASS]);

                    if (filesToDelete.length) {
                        const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

                        transactionsList.push(
                            DraftCarsFilesService.removeRecordsByFileIdsAsTransaction(ids)
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

        return success(res, { id: carId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editCar,
};
