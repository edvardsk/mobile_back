const uuid = require('uuid/v4');
const { success } = require('api/response');

// services
const CarsServices = require('services/tables/cars');
const CarsStateNumbersService = require('services/tables/cars-state-numbers');
const CarsFilesService = require('services/tables/cars-to-files');
const TrailersServices = require('services/tables/trailers');
const TrailersStateNumbersService = require('services/tables/trailers-state-numbers');
const TrailersFilesService = require('services/tables/trailers-to-files');
const FilesService = require('services/tables/files');
const TablesService = require('services/tables/index');
const S3Service = require('services/aws/s3');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');
const { DOCUMENTS } = require('constants/files');

// formatters
const CarsFormatters = require('formatters/cars');
const TrailersFormatters = require('formatters/trailers');
const FilesFormatters = require('formatters/files');

const colsCarsNumbers = SQL_TABLES.CARS_STATE_NUMBERS.COLUMNS;
const colsTrailersNumbers = SQL_TABLES.TRAILERS_STATE_NUMBERS.COLUMNS;

const MAP_CARS_PROPS_AND_FILES = {
    [HOMELESS_COLUMNS.CAR_DANGER_CLASS]: DOCUMENTS.DANGER_CLASS,
    [HOMELESS_COLUMNS.CAR_VEHICLE_REGISTRATION_PASSPORT]: DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT,
    [HOMELESS_COLUMNS.CAR_VEHICLE_TECHNICAL_INSPECTION]: DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION,
    [HOMELESS_COLUMNS.CAR_VEHICLE_PHOTO]: DOCUMENTS.VEHICLE_PHOTO,
};

const MAP_TRAILERS_PROPS_AND_FILES = {
    [HOMELESS_COLUMNS.TRAILER_DANGER_CLASS]: DOCUMENTS.DANGER_CLASS,
    [HOMELESS_COLUMNS.TRAILER_VEHICLE_REGISTRATION_PASSPORT]: DOCUMENTS.VEHICLE_REGISTRATION_PASSPORT,
    [HOMELESS_COLUMNS.TRAILER_VEHICLE_TECHNICAL_INSPECTION]: DOCUMENTS.VEHICLE_TECHNICAL_INSPECTION,
    [HOMELESS_COLUMNS.TRAILER_VEHICLE_PHOTO]: DOCUMENTS.VEHICLE_PHOTO,
};

const createCar = async (req, res, next) => {
    try {
        const { body, files } = req;
        const { company } = res.locals;
        const companyId = company.id;

        const transactionsList = [];
        let filesToStore = [];

        const isCar = body[HOMELESS_COLUMNS.IS_CAR];
        const isTrailer = body[HOMELESS_COLUMNS.IS_TRAILER];

        const result = {};
        let carId = null;

        if (isCar) {
            carId = uuid();
            const carStateNumberData = {
                [colsCarsNumbers.CAR_ID]: carId,
                [colsCarsNumbers.NUMBER]: body[HOMELESS_COLUMNS.CAR_STATE_NUMBER].toUpperCase(),
            };

            const carData = CarsFormatters.formatCarToSave(carId, companyId, body);

            transactionsList.push(
                CarsServices.addRecordAsTransaction(carData)
            );
            transactionsList.push(
                CarsStateNumbersService.addRecordAsTransaction(carStateNumberData)
            );

            const selectedFiles = FilesFormatters.selectFilesToStore(files, MAP_CARS_PROPS_AND_FILES);

            const [dbFiles, dbCarsFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForCars(selectedFiles, carId);
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

            result.carId = carId;
        }

        if (isTrailer) {
            const trailerId = uuid();
            const trailerStateNumberData = {
                [colsTrailersNumbers.TRAILER_ID]: trailerId,
                [colsTrailersNumbers.NUMBER]: body[HOMELESS_COLUMNS.TRAILER_STATE_NUMBER],
            };

            const trailerData = TrailersFormatters.formatTrailerToSave(companyId, trailerId, body, carId);

            transactionsList.push(
                TrailersServices.addRecordAsTransaction(trailerData)
            );
            transactionsList.push(
                TrailersStateNumbersService.addRecordAsTransaction(trailerStateNumberData)
            );

            const selectedFiles = FilesFormatters.selectFilesToStore(files, MAP_TRAILERS_PROPS_AND_FILES);

            const [dbFiles, dbTrailersFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForTrailers(selectedFiles, trailerId);
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

            result.trailerId = trailerId;
        }

        await TablesService.runTransaction(transactionsList);

        await Promise.all(filesToStore.map(({ bucket, path, data, contentType }) => {
            return S3Service.putObject(bucket, path, data, contentType);
        }));

        return success(res, { ...result }, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCar,
};
