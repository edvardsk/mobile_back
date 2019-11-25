const uuid = require('uuid/v4');
const { success } = require('api/response');

// services
const CarsServices = require('services/tables/cars');
const CarsStateNumbersService = require('services/tables/cars-state-numbers');
const FilesService = require('services/tables/files');
const CarsFilesService = require('services/tables/cars-to-files');
const TablesService = require('services/tables/index');
const S3Service = require('services/aws/s3');

// constants
const { SUCCESS_CODES } = require('constants/http-codes');
const { SQL_TABLES, HOMELESS_COLUMNS } = require('constants/tables');

// formatters
const CarsFormatters = require('formatters/cars');
const FilesFormatters = require('formatters/files');

const colsCarsNumbers = SQL_TABLES.CARS_STATE_NUMBERS.COLUMNS;

const createCar = async (req, res, next) => {
    try {
        const { body, files } = req;
        const { company } = res.locals;
        const companyId = company.id;

        const transactionsList = [];
        let filesToStore = [];

        const isCar = body[HOMELESS_COLUMNS.IS_CAR];
        const carId = uuid();


        if (isCar) {
            const carStateNumberData = {
                [colsCarsNumbers.CAR_ID]: carId,
                [colsCarsNumbers.NUMBER]: body[HOMELESS_COLUMNS.CAR_STATE_NUMBER],
            };

            const carData = CarsFormatters.formatCarToSave(carId, companyId, body);

            transactionsList.push(
                CarsServices.addRecordAsTransaction(carData)
            );
            transactionsList.push(
                CarsStateNumbersService.addRecordAsTransaction(carStateNumberData)
            );

            const [dbFiles, dbCarsFiles, storageFiles] = FilesFormatters.prepareFilesToStoreForCars(files, carId);
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

        await Promise.all(filesToStore.map(({ bucket, path, data, contentType }) => {
            return S3Service.putObject(bucket, path, data, contentType);
        }));

        await TablesService.runTransaction(transactionsList);

        return success(res, { id: carId }, SUCCESS_CODES.CREATED);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCar,
};
