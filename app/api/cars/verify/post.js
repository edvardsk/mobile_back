const { success, reject } = require('api/response');

// services
const CarsService = require('services/tables/cars');
const DraftCarsService = require('services/tables/draft-cars');
const DraftCarsFilesService = require('services/tables/draft-cars-to-files');
const FilesService = require('services/tables/files');
const CarsFilesService = require('services/tables/cars-to-files');
const DraftFilesService = require('services/tables/draft-files');
const DangerClassesService = require('services/tables/danger-classes');
const CarsStateNumbersService = require('services/tables/cars-state-numbers');
const TablesService = require('services/tables');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { ERRORS } = require('constants/errors');
const { DOCUMENTS } = require('constants/files');
const { CAR_TYPES_MAP } = require('constants/cars');

// formatters
const CarsFormatters = require('formatters/cars');
const FilesFormatters = require('formatters/files');

// helpers
const { isDangerous } = require('helpers/danger-classes');

const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsDraftCars = SQL_TABLES.DRAFT_CARS.COLUMNS;
const colsDangerClasses = SQL_TABLES.DANGER_CLASSES.COLUMNS;
const colsCarsStateNumbers = SQL_TABLES.CARS_STATE_NUMBERS.COLUMNS;

const verifyCar = async (req, res, next) => {
    try {
        const { carId } = req.params;

        const [car, draftCar] = await Promise.all([
            CarsService.getRecordStrict(carId),
            DraftCarsService.getRecordByCarId(carId),
        ]);

        if (car[colsCars.VERIFIED] && !car[colsCars.SHADOW] && !draftCar) {
            return reject(res, ERRORS.VERIFY.ALREADY_VERIFIED);
        }

        const transactionsList = [];
        let urlsToDelete = [];
        let carData = {};
        if (!car[colsCars.VERIFIED]) {
            carData = CarsFormatters.formatRecordAsVerified();
        }
        if (car[colsCars.SHADOW]) {
            carData = CarsFormatters.formatRecordAsNotShadow(carData);
        }

        if (draftCar) {
            carData = {
                ...carData,
                ...CarsFormatters.formatRecordToUpdateFromDraft(draftCar),
                ...CarsFormatters.formatRecordAsNotShadow(),
                ...CarsFormatters.formatRecordAsVerified(),
            };

            const draftFiles = await DraftFilesService.getFilesByDraftCarId(draftCar.id);
            if (draftFiles.length) {
                const basicDraftLabels = FilesFormatters.formatBasicFileLabels(draftFiles);
                const filesToDelete = await FilesService.getFilesByCarIdAndArrayLabels(carId, basicDraftLabels);
                if (filesToDelete.length) {
                    const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);
                    urlsToDelete = [...urls];

                    transactionsList.push(
                        CarsFilesService.removeRecordsByFileIdsAsTransaction(ids)
                    );
                    transactionsList.push(
                        FilesService.removeFilesByIdsAsTransaction(ids)
                    );
                }
                const [dbFiles, dbCarsFiles] = FilesFormatters.prepareFilesToStoreForCarsFromDraft(draftFiles, carId);
                transactionsList.push(
                    FilesService.addFilesAsTransaction(dbFiles)
                );
                transactionsList.push(
                    CarsFilesService.addRecordsAsTransaction(dbCarsFiles)
                );

                const draftFilesIds = draftFiles.map(file => file.id);
                transactionsList.push(
                    DraftCarsFilesService.removeRecordsByFileIdsAsTransaction(draftFilesIds)
                );
                transactionsList.push(
                    DraftFilesService.removeFilesByIdsAsTransaction(draftFilesIds)
                );
            }

            const newDangerClassId = draftCar[colsDraftCars.CAR_DANGER_CLASS_ID];
            const oldDangerClassId = car[colsCars.CAR_DANGER_CLASS_ID];

            const newCarType = draftCar[colsDraftCars.CAR_TYPE];
            const oldCarType = car[colsCars.CAR_TYPE];

            const [oldDangerClass, newDangerClass] = await Promise.all([
                oldDangerClassId && DangerClassesService.getRecord(oldDangerClassId),
                newDangerClassId && DangerClassesService.getRecord(newDangerClassId),
            ]);

            const oldDangerClassName = oldDangerClass && oldDangerClass[colsDangerClasses.NAME];
            const newDangerClassName = newDangerClass && newDangerClass[colsDangerClasses.NAME];

            if (
                (newCarType === CAR_TYPES_MAP.QUAD && oldCarType === CAR_TYPES_MAP.TRUCK && isDangerous(oldDangerClassName)) ||
                (oldCarType === CAR_TYPES_MAP.TRUCK && isDangerous(oldDangerClassName) && newCarType === CAR_TYPES_MAP.TRUCK && !isDangerous(newDangerClassName))
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

            const oldStateNumber = car[HOMELESS_COLUMNS.CAR_STATE_NUMBER];
            const newStateNumber = draftCar[colsDraftCars.CAR_STATE_NUMBER];

            if (oldStateNumber !== newStateNumber) {
                transactionsList.push(
                    CarsStateNumbersService.editActiveRecordsByCarIdAsTransaction(carId, {
                        [colsCarsStateNumbers.IS_ACTIVE]: false,
                    })
                );

                const carStateNumberData = {
                    [colsCarsStateNumbers.CAR_ID]: carId,
                    [colsCarsStateNumbers.NUMBER]: newStateNumber,
                };

                transactionsList.push(
                    CarsStateNumbersService.addRecordAsTransaction(carStateNumberData)
                );
            }

            transactionsList.push(
                DraftCarsService.removeRecordAsTransaction(draftCar.id)
            );
        }

        transactionsList.push(
            CarsService.editRecordAsTransaction(carId, carData)
        );

        await TablesService.runTransaction(transactionsList);

        if (urlsToDelete.length) {
            await Promise.all(urlsToDelete.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));
        }

        return success(res, { carId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyCar,
};
