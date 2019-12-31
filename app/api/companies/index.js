const express = require('express');
const multer  = require('multer');
const { ROUTES } = require('constants/routes');
const getEmployees = require('./employees/get');
const putEmployees = require('./employees/put');
const get = require('./get');

const getData = require('./data/get');
const getCommon = require('./common/get');

const getFiles = require('./files/get');

const postSteps = require('./steps/post');
const getSteps = require('./steps/get');
const postApprove = require('./approve/post');

const postCargo = require('./cargos/post');
const getCargo = require('./cargos/get');
const putCargo = require('./cargos/put');
const deleteCargo = require('./cargos/delete');

const postCars = require('./cars/post');
const getCars = require('./cars/get');
const putCars = require('./cars/put');
const deleteCars = require('./cars/delete');

const getCarsDeals = require('./cars/deals/get');

const getTrailers = require('./trailers/get');
const deleteTrailers = require('./trailers/delete');
const putTrailers = require('./trailers/put');
const postLinkingTrailers = require('./trailers/linking/post');

const getTrailersDeals = require('./trailers/deals/get');

const getDriversDeals = require('./drivers/deals/get');

const postDealsCargos = require('./deals/cargos/post');
const postDealsCars = require('./deals/cars/post');
const getDeals = require('./deals/get');
const postDealsStatuses  = require('./deals/statuses/post');

// middlewares
const { isHasPermissions, injectCompanyData, injectTargetRole } = require('api/middlewares');
const {
    validate,
    validateChangeDealStatus,
} = require('api/middlewares/validator');
const { formDataHandler, createOrUpdateDataOnStep3 } = require('api/middlewares/files');

// constants
const { PERMISSIONS, ROLES } = require('constants/system');
const {
    DEAL_STATUSES_ROUTE,
} = require('constants/deal-statuses');

// helpers
const ValidatorSchemes = require('helpers/validators/schemes');

const router = express.Router();
const upload = multer();
const uploadData = upload.any();

const MAP_TARGET_ROLE_AND_PERMISSIONS = {
    [ROLES.DRIVER]: [
        PERMISSIONS.MODIFY_DRIVER,
    ],
};

const MAP_TARGET_ROLE_AND_SCHEMES = {
    [ROLES.DRIVER]: ValidatorSchemes.createOrModifyDriver,
};

const MAP_TARGET_ROLE_AND_SCHEMES_FILES = {
    [ROLES.DRIVER]: ValidatorSchemes.notRequiredFiles,
};

const CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1Transporter,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep1Holder,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep1IndividualForwarder,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep1SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep1TransporterAsyncFunc,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep1HolderAsyncFunc,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep1IndividualForwarderAsyncFunc,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep1SoleProprietorForwarderAsyncFunc,
};

const CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep2Transporter,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep2Holder,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep2SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep2TransporterAsyncFunc,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep2HolderAsyncFunc,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep2SoleProprietorForwarderAsyncFunc,
};

const CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3Transporter,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep3Holder,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarder,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarder,
};

const CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES_ASYNC = {
    [ROLES.TRANSPORTER]: ValidatorSchemes.finishRegistrationStep3TransporterAsyncFunc,
    [ROLES.HOLDER]: ValidatorSchemes.finishRegistrationStep3HolderAsyncFunc,
    [ROLES.INDIVIDUAL_FORWARDER]: ValidatorSchemes.finishRegistrationStep3IndividualForwarderAsyncFunc,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ValidatorSchemes.finishRegistrationStep3SoleProprietorForwarderAsyncFunc,
};

// employees
router.get(
    ROUTES.COMPANIES.EMPLOYEES.BASE + ROUTES.COMPANIES.EMPLOYEES.GET_ALL,
    isHasPermissions([PERMISSIONS.READ_EMPLOYEES]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.baseSortingSortingDirectionQuery, 'query'),
    validate(ValidatorSchemes.companyEmployeesSortColumnQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.companyEmployeesFilterQuery, 'query'),
    getEmployees.getListEmployees,
);

router.get(
    ROUTES.COMPANIES.EMPLOYEES.BASE + ROUTES.COMPANIES.EMPLOYEES.ROLES.BASE + ROUTES.COMPANIES.EMPLOYEES.ROLES.GET,
    isHasPermissions([PERMISSIONS.READ_EMPLOYEES]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.companyDriversFilterQuery, 'query'),
    getEmployees.getListDrivers,
);

router.get(
    ROUTES.COMPANIES.EMPLOYEES.BASE + ROUTES.COMPANIES.EMPLOYEES.USERS.BASE + ROUTES.COMPANIES.EMPLOYEES.USERS.GET,
    isHasPermissions([PERMISSIONS.READ_EMPLOYEES]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredUserId, 'params'),
    validate(ValidatorSchemes.requiredExistingUserWithIdAsync, 'params'),
    getEmployees.getEmployee,
);

router.put(
    ROUTES.COMPANIES.EMPLOYEES.BASE + ROUTES.COMPANIES.EMPLOYEES.USERS.BASE + ROUTES.COMPANIES.EMPLOYEES.USERS.ADVANCED.BASE + ROUTES.COMPANIES.EMPLOYEES.USERS.ADVANCED.PUT,
    isHasPermissions([PERMISSIONS.MODIFY_EMPLOYEES]),
    validate(ValidatorSchemes.requiredUserId, 'params'),
    validate(ValidatorSchemes.requiredExistingUserWithIdAsync, 'params'),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectTargetRole,
    formDataHandler(uploadData), // uploading files middleware
    isHasPermissions(({ targetRole }) => MAP_TARGET_ROLE_AND_PERMISSIONS[targetRole]),
    validate(({ targetRole }) => MAP_TARGET_ROLE_AND_SCHEMES[targetRole]),
    validate(({ requestParams }) => ValidatorSchemes.modifyEmployeeAsyncFunc(requestParams.userId)),
    validate(ValidatorSchemes.phoneNumberWithPrefixAsync),
    validate(({ targetRole }) => MAP_TARGET_ROLE_AND_SCHEMES_FILES[targetRole], 'files'),
    injectCompanyData,
    putEmployees.editEmployeeAdvanced,
);


// data
router.get(
    ROUTES.COMPANIES.GET_ALL,
    isHasPermissions([PERMISSIONS.READ_COMPANIES]),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.baseSortingSortingDirectionQuery, 'query'),
    validate(ValidatorSchemes.companiesSortColumnQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.companiesFilterQuery, 'query'),
    get.getListCompanies,
);

router.get(
    ROUTES.COMPANIES.COMMON_DATA.BASE + ROUTES.COMPANIES.COMMON_DATA.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    getCommon.geCommonData,
);

router.get(
    ROUTES.COMPANIES.LEGAL_DATA.BASE + ROUTES.COMPANIES.LEGAL_DATA.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    getData.getLegalData,
);

router.get(
    ROUTES.COMPANIES.FILES.BASE + ROUTES.COMPANIES.FILES.GROUPS.BASE + ROUTES.COMPANIES.FILES.GROUPS.GET,
    isHasPermissions([PERMISSIONS.READ_LEGAL_DATA]),
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.listFilesGroupParams, 'params'),
    injectCompanyData,
    getFiles.getGroupFiles,
);


// modify company steps
router.post(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['1'].BASE + ROUTES.COMPANIES.STEPS['1'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_1]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(({ companyHeadRole }) => CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES[companyHeadRole]),
    validate(({ company, companyHeadRole }) => (
        CREATE_OR_MODIFY_STEP_1_TEXT_MAP_SCHEMES_ASYNC[companyHeadRole]({ companyId: company.id })
    )),
    postSteps.editStep1,
);

router.post(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['2'].BASE + ROUTES.COMPANIES.STEPS['2'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_2]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(({ companyHeadRole }) => CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES[companyHeadRole]),
    validate(({ company, companyHeadRole }) => (
        CREATE_OR_MODIFY_STEP_2_TEXT_MAP_SCHEMES_ASYNC[companyHeadRole]({ companyId: company.id })
    )),
    validate(ValidatorSchemes.settlementAccountAsync),
    postSteps.editStep2,
);

router.post(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['3'].BASE + ROUTES.COMPANIES.STEPS['3'].POST,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_3]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    formDataHandler(uploadData), // uploading files middleware
    validate(ValidatorSchemes.modifyOtherOrganizations),
    validate(({ companyHeadRole }) => CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES[companyHeadRole]),
    validate(({ company, companyHeadRole }) => (
        CREATE_OR_MODIFY_STEP_3_TEXT_MAP_SCHEMES_ASYNC[companyHeadRole]({ companyId: company.id })
    )),
    validate(ValidatorSchemes.notRequiredFiles, 'files'),
    postSteps.editStep3,
    createOrUpdateDataOnStep3,
);


// get company data steps
router.get(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['1'].BASE + ROUTES.COMPANIES.STEPS['1'].GET,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_1]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    getSteps.getStep1,
);

router.get(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['2'].BASE + ROUTES.COMPANIES.STEPS['2'].GET,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_2]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    getSteps.getStep2,
);

router.get(
    ROUTES.COMPANIES.STEPS.BASE + ROUTES.COMPANIES.STEPS['3'].BASE + ROUTES.COMPANIES.STEPS['3'].GET,
    isHasPermissions([PERMISSIONS.MODIFY_COMPANY_DATA_STEP_3]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    getSteps.getStep3,
);


// approve company
router.post(
    ROUTES.COMPANIES.APPROVE.BASE + ROUTES.COMPANIES.APPROVE.POST,
    isHasPermissions([PERMISSIONS.APPROVE_COMPANY]), // permissions middleware
    validate(ValidatorSchemes.requiredCompanyIdParams, 'params'),
    validate(ValidatorSchemes.requiredExistingCompanyWithIdAsync, 'params'),
    postApprove.approveCompany,
);

// cargos
router.post(
    ROUTES.COMPANIES.CARGOS.BASE + ROUTES.COMPANIES.CARGOS.POST,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.createOrEditCargo),
    validate(ValidatorSchemes.createOrEditCargoAsync),
    postCargo.createCargo,
);

router.get(
    ROUTES.COMPANIES.CARGOS.BASE + ROUTES.COMPANIES.CARGOS.GET_ALL,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.cargosFilterQuery, 'query'),
    injectCompanyData,
    getCargo.getCargos,
);

router.get(
    ROUTES.COMPANIES.CARGOS.BASE + ROUTES.COMPANIES.CARGOS.GET,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.requiredCargoId, 'params'),
    injectCompanyData,
    validate(({ company }) => ValidatorSchemes.requiredExistingCargoInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    getCargo.getCargo,
);

router.put(
    ROUTES.COMPANIES.CARGOS.BASE + ROUTES.COMPANIES.CARGOS.PUT,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.requiredCargoId, 'params'),
    injectCompanyData,
    validate(({ company }) => ValidatorSchemes.requiredExistingCargoInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    validate(ValidatorSchemes.createOrEditCargo),
    validate(ValidatorSchemes.createOrEditCargoAsync),
    putCargo.editCargo,
);

router.delete(
    ROUTES.COMPANIES.CARGOS.BASE + ROUTES.COMPANIES.CARGOS.DELETE,
    isHasPermissions([PERMISSIONS.CRUD_CARGO]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.requiredCargoId, 'params'),
    injectCompanyData,
    validate(({ company }) => ValidatorSchemes.requiredExistingCargoInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    deleteCargo.removeCargo,
);


// cars
router.post(
    ROUTES.COMPANIES.CARS.BASE + ROUTES.COMPANIES.CARS.POST,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    formDataHandler(uploadData),
    validate(ValidatorSchemes.createCarTrailerCondition),
    validate(ValidatorSchemes.modifyCarTrailerIdentityKeys),
    validate(ValidatorSchemes.modifyCreateCarArrays),
    validate(ValidatorSchemes.modifyCreateTrailerArrays),
    validate(ValidatorSchemes.createCarCommon),
    validate(ValidatorSchemes.createTrailerCommon),
    validate(ValidatorSchemes.createCarCommonAsync),
    validate(ValidatorSchemes.createTrailerCommonAsync),
    validate(ValidatorSchemes.createCarCommonFiles, ['body', 'files']),
    validate(ValidatorSchemes.createTrailerCommonFiles, ['body', 'files']),
    validate(ValidatorSchemes.createCarTruck),
    validate(ValidatorSchemes.createCarTruckAsync),
    validate(ValidatorSchemes.createCarTruckFiles, ['body', 'files']),
    validate(ValidatorSchemes.createCarTruckFilesCheckDangerClassAsync, ['body', 'files']),
    validate(ValidatorSchemes.createTrailerFilesCheckDangerClassAsync, ['body', 'files']),
    validate(ValidatorSchemes.modifyCreateCarFloats),
    validate(ValidatorSchemes.modifyCreateTrailerFloats),
    postCars.createCar,
);

router.get(
    ROUTES.COMPANIES.CARS.BASE + ROUTES.COMPANIES.CARS.GET_ALL,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.carsFilterQuery, 'query'),
    injectCompanyData,
    getCars.getListCars,
);

router.get(
    ROUTES.COMPANIES.CARS.BASE + ROUTES.COMPANIES.CARS.GET,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredCarId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingCarInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    getCars.getCar,
);

router.put(
    ROUTES.COMPANIES.CARS.BASE + ROUTES.COMPANIES.CARS.PUT,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredCarId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingCarInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    formDataHandler(uploadData),
    validate(ValidatorSchemes.modifyEditCarArrays),
    validate(ValidatorSchemes.editCarCommon),
    validate(({ requestParams }) => ValidatorSchemes.editCarCommonAsyncFunc({ carId: requestParams.carId })),
    validate(ValidatorSchemes.editCarCommonFiles, 'files'),
    validate(ValidatorSchemes.editCarTruck),
    validate(ValidatorSchemes.editCarTruckAsync),
    validate(ValidatorSchemes.editCarTruckFiles, ['body', 'files']),
    validate(({ requestParams }) => ValidatorSchemes.editCarTruckFilesCheckDangerClassAsyncFunc({ carId: requestParams.carId}), ['body', 'files']),
    validate(ValidatorSchemes.modifyEditCarTruckFloats),
    putCars.editCar,
);

router.delete(
    ROUTES.COMPANIES.CARS.BASE + ROUTES.COMPANIES.CARS.DELETE,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredCarId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingCarInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    deleteCars.removeCar,
);

router.get(
    ROUTES.COMPANIES.CARS.BASE + ROUTES.COMPANIES.CARS.DEALS.BASE + ROUTES.COMPANIES.CARS.DEALS.CARGOS.BASE +
    ROUTES.COMPANIES.CARS.DEALS.CARGOS.AVAILABLE.BASE + ROUTES.COMPANIES.CARS.DEALS.CARGOS.AVAILABLE.GET,
    isHasPermissions([PERMISSIONS.CREATE_CARGO_DEAL]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.requiredCargoId, 'params'),
    validate(ValidatorSchemes.requiredExistingFreeCargoAsync, 'params'),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.carsDealsAvailableFilterQuery, 'query'),
    injectCompanyData,
    getCarsDeals.getAvailableCars,
);


// trailers
router.get(
    ROUTES.COMPANIES.TRAILERS.BASE + ROUTES.COMPANIES.TRAILERS.GET_ALL,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.trailersFilterQuery, 'query'),
    injectCompanyData,
    getTrailers.getListTrailers,
);

router.get(
    ROUTES.COMPANIES.TRAILERS.BASE + ROUTES.COMPANIES.TRAILERS.GET,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingTrailerInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    getTrailers.getTrailer,
);

router.delete(
    ROUTES.COMPANIES.TRAILERS.BASE + ROUTES.COMPANIES.TRAILERS.DELETE,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingTrailerInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    deleteTrailers.removeTrailer,
);

router.put(
    ROUTES.COMPANIES.TRAILERS.BASE + ROUTES.COMPANIES.TRAILERS.PUT,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingTrailerInCompanyAsyncFunc({ companyId: company.id }), 'params'),
    formDataHandler(uploadData),
    validate(ValidatorSchemes.modifyCreateTrailerArrays),
    validate(ValidatorSchemes.editTrailer),
    validate(({ requestParams }) => ValidatorSchemes.editTrailerAsyncFunc({ trailerId: requestParams.trailerId })),
    validate(ValidatorSchemes.editTrailerFiles, 'files'),
    validate(({ requestParams, isControlRole }) => ValidatorSchemes.editTrailerFilesCheckDangerClassAsyncFunc({ trailerId: requestParams.trailerId, isControlRole }), ['body', 'files']),
    validate(ValidatorSchemes.modifyEditCarTruckFloats),
    putTrailers.editTrailer,
);

router.get(
    ROUTES.COMPANIES.TRAILERS.BASE + ROUTES.COMPANIES.TRAILERS.DEALS.BASE + ROUTES.COMPANIES.TRAILERS.DEALS.CARGOS.BASE +
    ROUTES.COMPANIES.TRAILERS.DEALS.CARGOS.AVAILABLE.BASE + ROUTES.COMPANIES.TRAILERS.DEALS.CARGOS.AVAILABLE.GET,
    isHasPermissions([PERMISSIONS.CREATE_CARGO_DEAL]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.requiredCargoId, 'params'),
    validate(ValidatorSchemes.requiredExistingFreeCargoAsync, 'params'),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.trailersDealsAvailableFilterQuery, 'query'),
    injectCompanyData,
    getTrailersDeals.getAvailableTrailers,
);

// trailers link/unlink
router.post(
    ROUTES.COMPANIES.TRAILERS.BASE + ROUTES.COMPANIES.TRAILERS.LINK.BASE + ROUTES.COMPANIES.TRAILERS.LINK.POST,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingTrailerInCompanyWithoutCarAsyncFunc({ companyId: company.id }), 'params'),
    validate(ValidatorSchemes.linkTrailerBody),
    validate(({ company }) => ValidatorSchemes.linkTrailerBodyAsyncFunc({ companyId: company.id })),
    postLinkingTrailers.linkTrailerWithCar,
);

router.post(
    ROUTES.COMPANIES.TRAILERS.BASE + ROUTES.COMPANIES.TRAILERS.UNLINK.BASE + ROUTES.COMPANIES.TRAILERS.UNLINK.POST,
    isHasPermissions([PERMISSIONS.CRUD_CARS]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredTrailerId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingTrailerInCompanyWithCarAsyncFunc({ companyId: company.id }), 'params'),
    postLinkingTrailers.unlinkTrailerFromCar,
);


// drivers
router.get(
    ROUTES.COMPANIES.DRIVERS.BASE + ROUTES.COMPANIES.DRIVERS.DEALS.BASE + ROUTES.COMPANIES.DRIVERS.DEALS.CARGOS.BASE +
    ROUTES.COMPANIES.DRIVERS.DEALS.CARGOS.AVAILABLE.BASE + ROUTES.COMPANIES.DRIVERS.DEALS.CARGOS.AVAILABLE.GET,
    isHasPermissions([PERMISSIONS.CREATE_CARGO_DEAL]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    validate(ValidatorSchemes.requiredCargoId, 'params'),
    validate(ValidatorSchemes.requiredExistingFreeCargoAsync, 'params'),
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.driversDealsAvailableFilterQuery, 'query'),
    injectCompanyData,
    getDriversDeals.getAvailableDrivers,
);


// deals
router.post(
    ROUTES.COMPANIES.DEALS.BASE + ROUTES.COMPANIES.DEALS.CARGOS.BASE + ROUTES.COMPANIES.DEALS.CARGOS.POST,
    isHasPermissions([PERMISSIONS.CREATE_CARGO_DEAL]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.createCargoDeal),
    validate(ValidatorSchemes.createCargoDealAsync),
    validate(ValidatorSchemes.createCargoDealPhoneNumberAsync),
    validate(ValidatorSchemes.createCargoDealPhoneNumberWithPrefixAsync),
    postDealsCargos.createCargoDeal,
);

router.post(
    ROUTES.COMPANIES.DEALS.BASE + ROUTES.COMPANIES.DEALS.CARS.BASE + ROUTES.COMPANIES.DEALS.CARS.POST,
    isHasPermissions([PERMISSIONS.CREATE_CAR_DEAL]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.createCarDeal),
    postDealsCars.createCarDeal,
);

router.get(
    ROUTES.COMPANIES.DEALS.BASE,
    isHasPermissions([PERMISSIONS.READ_LIST_DEALS]), // permissions middleware
    validate(ValidatorSchemes.basePaginationQuery, 'query'),
    validate(ValidatorSchemes.basePaginationModifyQuery, 'query'),
    validate(ValidatorSchemes.modifyFilterQuery, 'query'),
    validate(ValidatorSchemes.dealsFilterQuery, 'query'),
    injectCompanyData,
    getDeals.getListDeals,
);

router.get(
    ROUTES.COMPANIES.DEALS.BASE + ROUTES.COMPANIES.DEALS.GET,
    isHasPermissions([PERMISSIONS.READ_LIST_DEALS]), // permissions middleware
    injectCompanyData,
    getDeals.getDeal,
);

router.post(
    ROUTES.COMPANIES.DEALS.BASE + ROUTES.COMPANIES.DEALS.STATUSES.BASE +
    ROUTES.COMPANIES.DEALS.STATUSES.CONFIRM.BASE + ROUTES.COMPANIES.DEALS.STATUSES.CONFIRM.POST,
    isHasPermissions([PERMISSIONS.CHANGE_DEAL_STATUS_ADVANCED]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredDealId, 'params'),
    formDataHandler(uploadData), // uploading files middleware
    validate(({ company }) => ValidatorSchemes.requiredExistingOwnDealAsyncFunc({ companyId: company.id }), 'params'),
    validate(() => ValidatorSchemes.validateNextStepAsyncFunc({ nextStatus: DEAL_STATUSES_ROUTE.CONFIRM }), 'params'),
    validateChangeDealStatus(DEAL_STATUSES_ROUTE.CONFIRM),
    postDealsStatuses.setConfirmedStatus,
);

router.post(
    ROUTES.COMPANIES.DEALS.BASE + ROUTES.COMPANIES.DEALS.STATUSES.BASE +
    ROUTES.COMPANIES.DEALS.STATUSES.CANCEL.BASE + ROUTES.COMPANIES.DEALS.STATUSES.CANCEL.POST,
    isHasPermissions([PERMISSIONS.CHANGE_DEAL_STATUS_ADVANCED]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredDealId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingOwnDealAsyncFunc({ companyId: company.id }), 'params'),
    validate(() => ValidatorSchemes.validateNextStepAsyncFunc({ nextStatus: DEAL_STATUSES_ROUTE.CANCEL }), 'params'),
    postDealsStatuses.setCancelledStatus,
);

router.post(
    ROUTES.COMPANIES.DEALS.BASE + ROUTES.COMPANIES.DEALS.STATUSES.BASE +
    ROUTES.COMPANIES.DEALS.STATUSES.REJECT.BASE + ROUTES.COMPANIES.DEALS.STATUSES.REJECT.POST,
    isHasPermissions([PERMISSIONS.CHANGE_DEAL_STATUS_ADVANCED]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredDealId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingOwnDealAsyncFunc({ companyId: company.id }), 'params'),
    validate(() => ValidatorSchemes.validateNextStepAsyncFunc({ nextStatus: DEAL_STATUSES_ROUTE.REJECT }), 'params'),
    postDealsStatuses.setCancelledStatus,
);

router.post(
    ROUTES.COMPANIES.DEALS.BASE + ROUTES.COMPANIES.DEALS.STATUSES.BASE +
    ROUTES.COMPANIES.DEALS.STATUSES.REJECT.BASE + ROUTES.COMPANIES.DEALS.STATUSES.REJECT.POST,
    isHasPermissions([PERMISSIONS.CHANGE_DEAL_STATUS_ADVANCED]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredDealId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingOwnDealAsyncFunc({ companyId: company.id }), 'params'),
    validate(() => ValidatorSchemes.validateNextStepAsyncFunc({ nextStatus: DEAL_STATUSES_ROUTE.REJECT }), 'params'),
    postDealsStatuses.setCancelledStatus,
);

router.post(
    ROUTES.COMPANIES.DEALS.BASE + ROUTES.COMPANIES.DEALS.STATUSES.BASE +
    ROUTES.COMPANIES.DEALS.STATUSES.UPLOAD.BASE + ROUTES.COMPANIES.DEALS.STATUSES.REJECT.POST,
    isHasPermissions([PERMISSIONS.CHANGE_DEAL_STATUS_ADVANCED]), // permissions middleware
    validate(({ isControlRole }) => isControlRole ? ValidatorSchemes.meOrIdRequiredIdParams : ValidatorSchemes.meOrIdRequiredMeParams, 'params'),
    injectCompanyData,
    validate(ValidatorSchemes.requiredDealId, 'params'),
    validate(({ company }) => ValidatorSchemes.requiredExistingOwnDealAsyncFunc({ companyId: company.id }), 'params'),
    validate(() => ValidatorSchemes.validateNextStepAsyncFunc({ nextStatus: DEAL_STATUSES_ROUTE.UPLOAD }), 'params'),
    validateChangeDealStatus(DEAL_STATUSES_ROUTE.UPLOAD),
    postDealsStatuses.setDoubleConfirmedStatus,
);

module.exports = router;
