const FILES_TYPES = {
    DOCX: 'docx',
};

const DOCUMENTS = {
    PASSPORT: 'passport',
    STATE_REGISTRATION_CERTIFICATE: 'state_registration_certificate',
    INSURANCE_POLICY: 'insurance_policy',
    RESIDENCY_CERTIFICATE: 'residency_certificate',
    DRIVER_LICENSE: 'driver_license',
};

const DOCUMENTS_SET = new Set(Object.values(DOCUMENTS));

const FILES_GROUPS = {
    BASIC: 'basic',
    CUSTOM: 'custom',
};

module.exports = {
    FILES_TYPES,
    DOCUMENTS,
    DOCUMENTS_SET,
    FILES_GROUPS,
};
