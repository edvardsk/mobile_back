const { intersection } = require('lodash');
const { success } = require('api/response');

// services
const CarsServices = require('services/tables/cars');
const CarsStateNumbersService = require('services/tables/cars-state-numbers');
const FilesService = require('services/tables/files');
const CarsFilesService = require('services/tables/cars-to-files');
const TablesService = require('services/tables/index');
const S3Service = require('services/aws/s3');

// constants
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { CAR_TYPES_MAP } = require('constants/cars');
const { DOCUMENTS } = require('constants/files');

// formatters
const CarsFormatters = require('formatters/cars');
const FilesFormatters = require('formatters/files');

const colsCars = SQL_TABLES.CARS.COLUMNS;
const colsCarsNumbers = SQL_TABLES.CARS_STATE_NUMBERS.COLUMNS;

const editCar = async (req, res, next) => {
    try {
        const { body, files } = req;
        const { carId } = req.params;

        const stateNumber = body[HOMELESS_COLUMNS.CAR_STATE_NUMBER];
        const currentStateNumberRecord = await CarsStateNumbersService.getActiveRecordByCarIdStrict(carId);
        const currentStateNumber = currentStateNumberRecord[colsCarsNumbers.NUMBER];
        const carData = CarsFormatters.formatCarToEdit(body);

        const transactionsList = [
            CarsServices.editRecordAsTransaction(carId, carData)
        ];

        const carRequiredDocuments = [DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION, DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT];
        const passedFiles = Object.keys(files);
        const fileLabelsToDelete = intersection(carRequiredDocuments, passedFiles);
        if (fileLabelsToDelete.length) {
            const filesToDelete = await FilesService.getFilesByCarIdAndLabels(carId, fileLabelsToDelete);

            const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

            transactionsList.push(
                CarsFilesService.removeRecordsByFileIdsAsTransaction(ids)
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
                if (carRequiredDocuments.includes(fileName)) {
                    filesToStore[fileName] = files[fileName];
                }
            });
            const [dbFiles, dbCarsFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForCars(filesToStore, carId);

            transactionsList.push(
                FilesService.addFilesAsTransaction(dbFiles)
            );
            transactionsList.push(
                CarsFilesService.addRecordsAsTransaction(dbCarsFiles)
            );

            await Promise.all(storageFiles.map(({ bucket, path, data, contentType }) => {
                return S3Service.putObject(bucket, path, data, contentType);
            }));
        }

        if (stateNumber !== currentStateNumber) {
            transactionsList.push(
                CarsStateNumbersService.editActiveRecordsByCarIdAsTransaction(carId, {
                    [colsCarsNumbers.IS_ACTIVE]: false,
                })
            );

            const carStateNumberData = {
                [colsCarsNumbers.CAR_ID]: carId,
                [colsCarsNumbers.NUMBER]: currentStateNumber,
            };

            transactionsList.push(
                CarsStateNumbersService.addRecordAsTransaction(carStateNumberData)
            );
        }

        const carType = body[colsCars.CAR_TYPE];

        const carFromDb = await CarsServices.getRecordStrict(carId);
        const dangerClassId = body[colsCars.CAR_DANGER_CLASS_ID];
        const dangerClassFromDb = carFromDb[colsCars.CAR_DANGER_CLASS_ID];
        if (
            (dangerClassId !== dangerClassFromDb && dangerClassFromDb) ||
            (carType === CAR_TYPES_MAP.QUAD && carFromDb[colsCars.CAR_TYPE] === CAR_TYPES_MAP.TRUCK)
        ) { // remove old file with danger class
            const filesToDelete = await FilesService.getFilesByCarIdAndLabels(carId, [DOCUMENTS.DANGER_CLASS]);

            const [ids, urls] = FilesFormatters.prepareFilesToDelete(filesToDelete);

            transactionsList.push(
                CarsFilesService.removeRecordsByFileIdsAsTransaction(ids)
            );
            transactionsList.push(
                FilesService.removeFilesByIdsAsTransaction(ids)
            );

            await Promise.all(urls.map(url => {
                const [bucket, path] = url.split('/');
                return S3Service.deleteObject(bucket, path);
            }));
        }
        if (carType === CAR_TYPES_MAP.TRUCK && dangerClassId !== dangerClassFromDb && dangerClassId) { // add new version of danger class
            const [dbFiles, dbCarsFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForCars({
                [DOCUMENTS.DANGER_CLASS]: files[DOCUMENTS.DANGER_CLASS],
            }, carId);

            transactionsList.push(
                FilesService.addFilesAsTransaction(dbFiles)
            );
            transactionsList.push(
                CarsFilesService.addRecordsAsTransaction(dbCarsFiles)
            );

            await Promise.all(storageFiles.map(({ bucket, path, data, contentType }) => {
                return S3Service.putObject(bucket, path, data, contentType);
            }));
        }

        await TablesService.runTransaction(transactionsList);

        return success(res, { id: carId });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    editCar,
};
