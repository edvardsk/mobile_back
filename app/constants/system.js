const ROLES = {
    UNCONFIRMED_TRANSPORTER: 'unconfirmed_transporter',
    UNCONFIRMED_HOLDER: 'unconfirmed_holder',
    UNCONFIRMED_INDIVIDUAL_FORWARDER: 'unconfirmed_individual_forwarder',
    UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER: 'unconfirmed_sole_proprietor_forwarder',
    UNCONFIRMED_MANAGER: 'unconfirmed_manager',
    UNCONFIRMED_DISPATCHER: 'unconfirmed_dispatcher',
    UNCONFIRMED_LOGISTICIAN: 'unconfirmed_logistician',

    CONFIRMED_EMAIL_TRANSPORTER: 'confirmed_email_transporter',
    CONFIRMED_EMAIL_HOLDER: 'confirmed_email_holder',
    CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER: 'confirmed_email_individual_forwarder',
    CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER: 'confirmed_email_sole_proprietor_forwarder',
    CONFIRMED_EMAIL_MANAGER: 'confirmed_email_manager',
    CONFIRMED_EMAIL_DISPATCHER: 'confirmed_email_dispatcher',
    CONFIRMED_EMAIL_LOGISTICIAN: 'confirmed_email_logistician',

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
    LOGISTICIAN: 'logistician'
};

const MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE = {
    [ROLES.UNCONFIRMED_TRANSPORTER]: ROLES.CONFIRMED_EMAIL_TRANSPORTER,
    [ROLES.UNCONFIRMED_HOLDER]: ROLES.CONFIRMED_EMAIL_HOLDER,
    [ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER]: ROLES.CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER,
    [ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER]: ROLES.CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER,

    [ROLES.UNCONFIRMED_DISPATCHER]: ROLES.CONFIRMED_EMAIL_DISPATCHER,
    [ROLES.UNCONFIRMED_LOGISTICIAN]: ROLES.CONFIRMED_EMAIL_LOGISTICIAN,

    [ROLES.UNCONFIRMED_MANAGER]: ROLES.CONFIRMED_EMAIL_MANAGER,
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
};

const UNCONFIRMED_EMAIL_ROLES = [
    ROLES.UNCONFIRMED_TRANSPORTER,
    ROLES.UNCONFIRMED_HOLDER,
    ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER,
    ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER
];

const ROLES_TO_REGISTER = [
    ROLES.TRANSPORTER, ROLES.HOLDER, ROLES.INDIVIDUAL_FORWARDER, ROLES.SOLE_PROPRIETOR_FORWARDER,
];

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
};

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
]);

const MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED = {
    [ROLES.DISPATCHER]: ROLES.UNCONFIRMED_DISPATCHER,
    [ROLES.LOGISTICIAN]: ROLES.UNCONFIRMED_LOGISTICIAN,
    [ROLES.MANAGER]: ROLES.UNCONFIRMED_MANAGER,
};

const SET_ROLES_TO_APPLY_COMPANY_FOR_INVITE = new Set([
    ROLES.UNCONFIRMED_DISPATCHER,
    ROLES.UNCONFIRMED_LOGISTICIAN,
]);

const MAP_ALLOWED_ROLES_TO_RESEND_EMAIL = {
    [ROLES.ADMIN]: new Set([
        ROLES.UNCONFIRMED_MANAGER,
    ]),
    [ROLES.TRANSPORTER]: new Set([
        ROLES.UNCONFIRMED_DISPATCHER,
    ]),
    [ROLES.HOLDER]: new Set([
        ROLES.UNCONFIRMED_LOGISTICIAN,
    ]),
};

const PERMISSIONS = {
    AUTHORIZATION: 'authorization',
    FINISH_REGISTRATION: 'finish_registration',
    RESET_PASSWORD: 'reset_password',
    CONFIRM_EMAIL: 'confirm_email',
    CONFIRM_PHONE_NUMBER: 'confirm_phone_number',
    REGISTRATION_SAVE_STEP_1: 'registration_save_step_1',
    REGISTRATION_SAVE_STEP_2: 'registration_save_step_2',
    REGISTRATION_SAVE_STEP_3: 'registration_save_step_3',
    REGISTRATION_SAVE_STEP_4: 'registration_save_step_4',
    REGISTRATION_SAVE_STEP_5: 'registration_save_step_5',
    ACCEPT_REGISTRATION: 'accept_registration',
    EXPECT_REGISTRATION_CONFIRMATION: 'expect_registration_confirmation',

    FREEZE_MANAGER: 'freeze_manager',
    FREEZE_TRANSPORTER: 'freeze_transporter',
    FREEZE_HOLDER: 'freeze_holder',
    FREEZE_INDIVIDUAL_FORWARDER: 'freeze_individual_forwarder',
    FREEZE_SOLE_PROPRIETOR_FORWARDER: 'freeze_sole_proprietor_forwarder',
    FREEZE_DISPATCHER: 'freeze_dispatcher',
    FREEZE_LOGISTICIAN: 'freeze_logistician',

    INVITE_MANAGER: 'invite_manager',
    INVITE_DISPATCHER: 'invite_dispatcher',
    INVITE_LOGISTICIAN: 'invite_logistician',
    BASIC_INVITES: 'basic_invites',

    READ_EMPLOYEES: 'read_employees',
};

module.exports = {
    ROLES,
    ROLES_TO_REGISTER,
    PERMISSIONS,
    MAP_ROLES_FROM_CLIENT_TO_SERVER,
    MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE,
    MAP_FROM_CONFIRMED_EMAIL_TO_CONFIRMED_PHONE,
    MAP_FROM_PENDING_ROLE_TO_MAIN,
    MAP_UNCONFIRMED_TO_BASIC_ROLES,
    UNCONFIRMED_EMAIL_ROLES,
    SET_ALLOWED_ROLES_FOR_EMAIL_CONFIRMATION,
    SET_ALLOWED_ROLES_FOR_ADVANCED_EMAIL_CONFIRMATION,
    MAP_FROM_MAIN_ROLE_TO_UNCONFIRMED,
    SET_ROLES_TO_APPLY_COMPANY_FOR_INVITE,
    MAP_ALLOWED_ROLES_TO_RESEND_EMAIL,
};
