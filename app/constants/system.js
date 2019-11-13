const ROLES = {
    UNCONFIRMED_TRANSPORTER: 'unconfirmed_transporter',
    UNCONFIRMED_HOLDER: 'unconfirmed_holder',
    UNCONFIRMED_INDIVIDUAL_FORWARDER: 'unconfirmed_individual_forwarder',
    UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER: 'unconfirmed_sole_proprietor_forwarder',
    UNCONFIRMED_MANAGER: 'unconfirmed_manager',
    UNCONFIRMED_DISPATCHER: 'unconfirmed_dispatcher',
    UNCONFIRMED_LOGISTICIAN: 'unconfirmed_logistician',
    UNCONFIRMED_DRIVER: 'unconfirmed_driver',

    CONFIRMED_EMAIL_TRANSPORTER: 'confirmed_email_transporter',
    CONFIRMED_EMAIL_HOLDER: 'confirmed_email_holder',
    CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER: 'confirmed_email_individual_forwarder',
    CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER: 'confirmed_email_sole_proprietor_forwarder',
    CONFIRMED_EMAIL_MANAGER: 'confirmed_email_manager',
    CONFIRMED_EMAIL_DISPATCHER: 'confirmed_email_dispatcher',
    CONFIRMED_EMAIL_LOGISTICIAN: 'confirmed_email_logistician',
    CONFIRMED_EMAIL_DRIVER: 'confirmed_email_driver',

    CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER: 'confirmed_email_and_phone_transporter',
    CONFIRMED_EMAIL_AND_PHONE_HOLDER: 'confirmed_email_and_phone_holder',
    CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER: 'confirmed_email_and_phone_individual_forwarder',
    CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER: 'confirmed_email_and_phone_sole_proprietor_forwarder',

    TRANSPORTER: 'transporter',
    HOLDER: 'holder',
    INDIVIDUAL_FORWARDER: 'individual_forwarder',
    SOLE_PROPRIETOR_FORWARDER: 'sole_proprietor_forwarder',

    ADMIN: 'admin',
    MANAGER: 'manager',
    DISPATCHER: 'dispatcher',
    LOGISTICIAN: 'logistician',
    DRIVER: 'driver',
};

const PERMISSIONS = {
    AUTHORIZATION: 'authorization',
    RESET_PASSWORD: 'reset_password',
    CONFIRM_EMAIL: 'confirm_email',
    CONFIRM_PHONE_NUMBER: 'confirm_phone_number',
    REGISTRATION_SAVE_STEP_1: 'registration_save_step_1',
    REGISTRATION_SAVE_STEP_2: 'registration_save_step_2',
    REGISTRATION_SAVE_STEP_3: 'registration_save_step_3',
    REGISTRATION_SAVE_STEP_4: 'registration_save_step_4',
    REGISTRATION_SAVE_STEP_5: 'registration_save_step_5',

    FREEZE_ADMIN: 'freeze_admin',
    FREEZE_MANAGER: 'freeze_manager',
    FREEZE_TRANSPORTER: 'freeze_transporter',
    FREEZE_HOLDER: 'freeze_holder',
    FREEZE_INDIVIDUAL_FORWARDER: 'freeze_individual_forwarder',
    FREEZE_SOLE_PROPRIETOR_FORWARDER: 'freeze_sole_proprietor_forwarder',
    FREEZE_DISPATCHER: 'freeze_dispatcher',
    FREEZE_LOGISTICIAN: 'freeze_logistician',
    FREEZE_DRIVER: 'freeze_driver',

    INVITE_MANAGER: 'invite_manager',
    INVITE_DISPATCHER: 'invite_dispatcher',
    INVITE_LOGISTICIAN: 'invite_logistician',
    INVITE_DRIVER: 'invite_driver',
    BASIC_INVITES: 'basic_invites',

    READ_EMPLOYEES: 'read_employees',
    READ_LEGAL_DATA: 'read_legal_info',
    MODIFY_EMPLOYEES: 'modify_employees',

    MODIFY_DRIVER: 'modify_driver',

    MODIFY_COMPANY_DATA_STEP_1: 'modify_company_data_step_1',
    MODIFY_COMPANY_DATA_STEP_2: 'modify_company_data_step_2',
    MODIFY_COMPANY_DATA_STEP_3: 'modify_company_data_step_3',

    READ_LIST_USERS: 'read_list_users',

    MODIFY_CONDITIONS_AND_TERMS: 'modify_conditions_and_terms',
    READ_CONDITIONS_AND_TERMS: 'read_conditions_and_terms',

    CRUD_CARGO: 'crud_cargo',

    READ_COMPANIES: 'read_companies',
    APPROVE_COMPANY: 'approve_company',
};

const ARRAY_ROLES_WITHOUT_ADMIN = Object.values(ROLES).filter(role => role !== ROLES.ADMIN);

const UNCONFIRMED_EMAIL_ROLES = [
    ROLES.UNCONFIRMED_TRANSPORTER,
    ROLES.UNCONFIRMED_HOLDER,
    ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER,
    ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER
];

const ROLES_TO_REGISTER = [
    ROLES.TRANSPORTER, ROLES.HOLDER, ROLES.INDIVIDUAL_FORWARDER, ROLES.SOLE_PROPRIETOR_FORWARDER,
];

const MAP_COMPANY_OWNERS_TO_MAIN_ROLES = {
    [ROLES.UNCONFIRMED_TRANSPORTER]: ROLES.TRANSPORTER,
    [ROLES.CONFIRMED_EMAIL_TRANSPORTER]: ROLES.TRANSPORTER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ROLES.TRANSPORTER,
    [ROLES.TRANSPORTER]: ROLES.TRANSPORTER,

    [ROLES.UNCONFIRMED_HOLDER]: ROLES.HOLDER,
    [ROLES.CONFIRMED_EMAIL_HOLDER]: ROLES.HOLDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ROLES.HOLDER,
    [ROLES.HOLDER]: ROLES.HOLDER,

    [ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,
    [ROLES.INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,

    [ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,
};

const MAP_ROLES_TO_MAIN_ROLE = {
    [ROLES.UNCONFIRMED_TRANSPORTER]: ROLES.TRANSPORTER,
    [ROLES.CONFIRMED_EMAIL_TRANSPORTER]: ROLES.TRANSPORTER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ROLES.TRANSPORTER,
    [ROLES.TRANSPORTER]: ROLES.TRANSPORTER,

    [ROLES.UNCONFIRMED_HOLDER]: ROLES.HOLDER,
    [ROLES.CONFIRMED_EMAIL_HOLDER]: ROLES.HOLDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ROLES.HOLDER,
    [ROLES.HOLDER]: ROLES.HOLDER,

    [ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,
    [ROLES.INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,

    [ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,

    [ROLES.UNCONFIRMED_DRIVER]: ROLES.DRIVER,
    [ROLES.CONFIRMED_EMAIL_DRIVER]: ROLES.DRIVER,
    [ROLES.DRIVER]: ROLES.DRIVER,
};

const MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE = {
    [ROLES.UNCONFIRMED_TRANSPORTER]: ROLES.CONFIRMED_EMAIL_TRANSPORTER,
    [ROLES.UNCONFIRMED_HOLDER]: ROLES.CONFIRMED_EMAIL_HOLDER,
    [ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER]: ROLES.CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER,
    [ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER]: ROLES.CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER,

    [ROLES.UNCONFIRMED_DISPATCHER]: ROLES.CONFIRMED_EMAIL_DISPATCHER,
    [ROLES.UNCONFIRMED_LOGISTICIAN]: ROLES.CONFIRMED_EMAIL_LOGISTICIAN,

    [ROLES.UNCONFIRMED_MANAGER]: ROLES.CONFIRMED_EMAIL_MANAGER,

    [ROLES.UNCONFIRMED_DRIVER]: ROLES.CONFIRMED_EMAIL_DRIVER,
};

const MAP_FROM_PENDING_ROLE_TO_MAIN = {
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: ROLES.TRANSPORTER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: ROLES.HOLDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: ROLES.INDIVIDUAL_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: ROLES.SOLE_PROPRIETOR_FORWARDER,
};

const MAP_FROM_CONFIRMED_EMAIL_TO_CONFIRMED_PHONE = {
    [ROLES.CONFIRMED_EMAIL_TRANSPORTER]: ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER,
    [ROLES.CONFIRMED_EMAIL_HOLDER]: ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER,
    [ROLES.CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER]: ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER]: ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER,

    [ROLES.CONFIRMED_EMAIL_DISPATCHER]: ROLES.DISPATCHER,
    [ROLES.CONFIRMED_EMAIL_LOGISTICIAN]: ROLES.LOGISTICIAN,

    [ROLES.CONFIRMED_EMAIL_MANAGER]: ROLES.MANAGER,

    [ROLES.CONFIRMED_EMAIL_DRIVER]: ROLES.DRIVER,
};

const MAP_ROLES_FROM_CLIENT_TO_SERVER = {
    [ROLES.TRANSPORTER]: ROLES.UNCONFIRMED_TRANSPORTER,
    [ROLES.HOLDER]: ROLES.UNCONFIRMED_HOLDER,
    [ROLES.INDIVIDUAL_FORWARDER]: ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER,
};

const MAP_UNCONFIRMED_TO_BASIC_ROLES = {
    [ROLES.UNCONFIRMED_MANAGER]: ROLES.MANAGER,
    [ROLES.UNCONFIRMED_DISPATCHER]: ROLES.DISPATCHER,
    [ROLES.UNCONFIRMED_LOGISTICIAN]: ROLES.LOGISTICIAN,
    [ROLES.UNCONFIRMED_DRIVER]: ROLES.DRIVER,
};

const MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED = {
    [ROLES.DISPATCHER]: ROLES.UNCONFIRMED_DISPATCHER,
    [ROLES.LOGISTICIAN]: ROLES.UNCONFIRMED_LOGISTICIAN,
    [ROLES.MANAGER]: ROLES.UNCONFIRMED_MANAGER,
    [ROLES.DRIVER]: ROLES.UNCONFIRMED_DRIVER,
};

const MAP_ALLOWED_ROLES_TO_RESEND_EMAIL = {
    [ROLES.ADMIN]: new Set([
        ROLES.UNCONFIRMED_MANAGER,
        ROLES.UNCONFIRMED_DISPATCHER,
        ROLES.UNCONFIRMED_LOGISTICIAN,
        ROLES.UNCONFIRMED_DRIVER,
    ]),
    [ROLES.MANAGER]: new Set([
        ROLES.UNCONFIRMED_DISPATCHER,
        ROLES.UNCONFIRMED_LOGISTICIAN,
        ROLES.UNCONFIRMED_DRIVER,
    ]),
    [ROLES.TRANSPORTER]: new Set([
        ROLES.UNCONFIRMED_DISPATCHER,
        ROLES.UNCONFIRMED_DRIVER,
    ]),
    [ROLES.HOLDER]: new Set([
        ROLES.UNCONFIRMED_LOGISTICIAN,
    ]),
    [ROLES.DISPATCHER]: new Set([
        ROLES.UNCONFIRMED_DRIVER,
    ]),
};

const MAP_ROLES_TO_FREEZING_PERMISSIONS = {
    [ROLES.UNCONFIRMED_TRANSPORTER]: PERMISSIONS.FREEZE_TRANSPORTER,
    [ROLES.UNCONFIRMED_HOLDER]: PERMISSIONS.FREEZE_HOLDER,
    [ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER]: PERMISSIONS.FREEZE_INDIVIDUAL_FORWARDER,
    [ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER]: PERMISSIONS.FREEZE_SOLE_PROPRIETOR_FORWARDER,
    [ROLES.UNCONFIRMED_MANAGER]: PERMISSIONS.FREEZE_MANAGER,
    [ROLES.UNCONFIRMED_DISPATCHER]: PERMISSIONS.FREEZE_DISPATCHER,
    [ROLES.UNCONFIRMED_LOGISTICIAN]: PERMISSIONS.FREEZE_LOGISTICIAN,
    [ROLES.UNCONFIRMED_DRIVER]: PERMISSIONS.FREEZE_DRIVER,

    [ROLES.CONFIRMED_EMAIL_TRANSPORTER]: PERMISSIONS.FREEZE_TRANSPORTER,
    [ROLES.CONFIRMED_EMAIL_HOLDER]: PERMISSIONS.FREEZE_HOLDER,
    [ROLES.CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER]: PERMISSIONS.FREEZE_INDIVIDUAL_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER]: PERMISSIONS.FREEZE_SOLE_PROPRIETOR_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_MANAGER]: PERMISSIONS.FREEZE_MANAGER,
    [ROLES.CONFIRMED_EMAIL_DISPATCHER]: PERMISSIONS.FREEZE_DISPATCHER,
    [ROLES.CONFIRMED_EMAIL_LOGISTICIAN]: PERMISSIONS.FREEZE_LOGISTICIAN,
    [ROLES.CONFIRMED_EMAIL_DRIVER]: PERMISSIONS.FREEZE_DRIVER,

    [ROLES.CONFIRMED_EMAIL_AND_PHONE_TRANSPORTER]: PERMISSIONS.FREEZE_TRANSPORTER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_HOLDER]: PERMISSIONS.FREEZE_HOLDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_INDIVIDUAL_FORWARDER]: PERMISSIONS.FREEZE_INDIVIDUAL_FORWARDER,
    [ROLES.CONFIRMED_EMAIL_AND_PHONE_SOLE_PROPRIETOR_FORWARDER]: PERMISSIONS.FREEZE_SOLE_PROPRIETOR_FORWARDER,

    [ROLES.TRANSPORTER]: PERMISSIONS.FREEZE_TRANSPORTER,
    [ROLES.HOLDER]: PERMISSIONS.FREEZE_HOLDER,
    [ROLES.INDIVIDUAL_FORWARDER]: PERMISSIONS.FREEZE_INDIVIDUAL_FORWARDER,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: PERMISSIONS.FREEZE_SOLE_PROPRIETOR_FORWARDER,

    [ROLES.ADMIN]: PERMISSIONS.FREEZE_ADMIN,
    [ROLES.MANAGER]: PERMISSIONS.FREEZE_MANAGER,
    [ROLES.DISPATCHER]: PERMISSIONS.FREEZE_DISPATCHER,
    [ROLES.LOGISTICIAN]: PERMISSIONS.FREEZE_LOGISTICIAN,
    [ROLES.DRIVER]: PERMISSIONS.FREEZE_DRIVER,
};

const MAP_ROLES_PRIORITY_TO_UNFREEZE = {
    [ROLES.ADMIN]: 5,
    [ROLES.MANAGER]: 4,

    [ROLES.TRANSPORTER]: 3,
    [ROLES.HOLDER]: 3,
    [ROLES.INDIVIDUAL_FORWARDER]: 3,
    [ROLES.SOLE_PROPRIETOR_FORWARDER]: 2,

    [ROLES.DISPATCHER]: 1,
    [ROLES.LOGISTICIAN]: 1,
};

const MAP_ROLES_TO_ROLES_TO_INVITE = {
    [ROLES.TRANSPORTER]: new Set([
        ROLES.DISPATCHER, ROLES.DRIVER,
    ]),
    [ROLES.HOLDER]: new Set([
        ROLES.LOGISTICIAN,
    ]),
    [ROLES.DISPATCHER]: new Set([
        ROLES.DRIVER,
    ]),
};

const SET_ROLES_TO_APPLY_COMPANY_FOR_INVITE = new Set([
    ROLES.UNCONFIRMED_DISPATCHER,
    ROLES.UNCONFIRMED_LOGISTICIAN,
]);

const SET_ALLOWED_ROLES_FOR_EMAIL_CONFIRMATION = new Set([
    ROLES.UNCONFIRMED_TRANSPORTER,
    ROLES.UNCONFIRMED_HOLDER,
    ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER,
    ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER,
]);

const SET_ALLOWED_ROLES_FOR_ADVANCED_EMAIL_CONFIRMATION = new Set([
    ROLES.UNCONFIRMED_MANAGER,
    ROLES.UNCONFIRMED_DISPATCHER,
    ROLES.UNCONFIRMED_LOGISTICIAN,
    ROLES.UNCONFIRMED_DRIVER,
]);

const SET_DRIVER_ROLES = new Set([
    ROLES.UNCONFIRMED_DRIVER, ROLES.CONFIRMED_EMAIL_DRIVER, ROLES.DRIVER
]);

module.exports = {
    ROLES,
    ARRAY_ROLES_WITHOUT_ADMIN,
    ROLES_TO_REGISTER,
    PERMISSIONS,
    UNCONFIRMED_EMAIL_ROLES,

    MAP_ROLES_FROM_CLIENT_TO_SERVER,
    MAP_ROLES_TO_MAIN_ROLE,
    MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE,
    MAP_FROM_CONFIRMED_EMAIL_TO_CONFIRMED_PHONE,
    MAP_FROM_PENDING_ROLE_TO_MAIN,
    MAP_UNCONFIRMED_TO_BASIC_ROLES,
    MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED,
    MAP_ALLOWED_ROLES_TO_RESEND_EMAIL,
    MAP_ROLES_TO_FREEZING_PERMISSIONS,
    MAP_ROLES_PRIORITY_TO_UNFREEZE,
    MAP_COMPANY_OWNERS_TO_MAIN_ROLES,
    MAP_ROLES_TO_ROLES_TO_INVITE,

    SET_ROLES_TO_APPLY_COMPANY_FOR_INVITE,
    SET_ALLOWED_ROLES_FOR_EMAIL_CONFIRMATION,
    SET_ALLOWED_ROLES_FOR_ADVANCED_EMAIL_CONFIRMATION,
    SET_DRIVER_ROLES,
};
