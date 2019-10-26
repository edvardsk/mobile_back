const ROLES = {
    UNCONFIRMED_TRANSPORTER: 'unconfirmed_transporter',
    UNCONFIRMED_HOLDER: 'unconfirmed_holder',
    UNCONFIRMED_INDIVIDUAL_FORWARDER: 'unconfirmed_individual_forwarder',
    UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER: 'unconfirmed_sole_proprietor_forwarder',
    UNCONFIRMED_MANAGER: 'unconfirmed_manager',
    UNCONFIRMED_DISPATCHER: 'unconfirmed_dispatcher',

    CONFIRMED_EMAIL_TRANSPORTER: 'confirmed_email_transporter',
    CONFIRMED_EMAIL_HOLDER: 'confirmed_email_holder',
    CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER: 'confirmed_email_individual_forwarder',
    CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER: 'confirmed_email_sole_proprietor_forwarder',
    CONFIRMED_EMAIL_MANAGER: 'confirmed_email_manager',
    CONFIRMED_EMAIL_DISPATCHER: 'confirmed_email_dispatcher',

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
};

const MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE = {
    [ROLES.UNCONFIRMED_TRANSPORTER]: ROLES.CONFIRMED_EMAIL_TRANSPORTER,
    [ROLES.UNCONFIRMED_HOLDER]: ROLES.CONFIRMED_EMAIL_HOLDER,
    [ROLES.UNCONFIRMED_INDIVIDUAL_FORWARDER]: ROLES.CONFIRMED_EMAIL_INDIVIDUAL_FORWARDER,
    [ROLES.UNCONFIRMED_SOLE_PROPRIETOR_FORWARDER]: ROLES.CONFIRMED_EMAIL_SOLE_PROPRIETOR_FORWARDER,
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

    [ROLES.CONFIRMED_EMAIL_MANAGER]: ROLES.MANAGER
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

    INVITE_MANAGER: 'invite_manager',
    INVITE_DISPATCHER: 'invite_dispatcher',
    INVITE_TRANSPORTER: 'invite_transporter',
    BASIC_INVITES: 'basic_invites',
};

module.exports = {
    ROLES,
    ROLES_TO_REGISTER,
    PERMISSIONS,
    MAP_ROLES_FROM_CLIENT_TO_SERVER,
    MAP_FROM_UNCONFIRMED_TO_CONFIRMED_EMAIL_ROLE,
    MAP_FROM_CONFIRMED_EMAIL_TO_CONFIRMED_PHONE,
    MAP_FROM_PENDING_ROLE_TO_MAIN,
    UNCONFIRMED_EMAIL_ROLES,
};
