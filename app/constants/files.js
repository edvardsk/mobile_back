const FILES_TYPES = {
    DOCX: 'docx',
};

const DOCUMENTS = {
    PASSPORT: 'passport',
    STATE_REGISTRATION_CERTIFICATE: 'state_registration_certificate',
    INSURANCE_POLICY: 'insurance_policy',
    RESIDENCY_CERTIFICATE: 'residency_certificate',
    DRIVER_LICENSE: 'driver_license',
    VISA: 'visa',
    DANGER_CLASS: 'danger_class',
    VEHICLE_REGISTRATION_PASSPORT: 'vehicle_registration_passport',
    VEHICLE_TECHNICAL_INSPECTION: 'vehicle_technical_inspection',
    VEHICLE_PHOTO: 'vehicle_photo',
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
