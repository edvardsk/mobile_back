const DEAL_STATUSES_MAP = {
    CREATED: 'created',
    CONFIRMED: 'confirmed',
    GOING_TO_UPLOADING: 'going_to_uploading',
    UPLOADING: 'uploading',
    IN_PROGRESS: 'in_progress',
    DOWNLOADING: 'downloading',

    DONE: 'done',
    FAILED: 'failed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
    WAIT_TRANSPORTER_PAYMENT: 'wait_transporter_payment',
};

const DEAL_STATUSES_ROUTE = {
    CREATE: 'create',
    CONFIRM: 'confirm',
    CANCEL: 'cancel',
    REJECT: 'reject',
    PROBLEM: 'problem',
    UPLOAD: 'upload',
    IN_PROGRESS: 'in_progress',
    DOWNLOAD: 'download',
    FINISH: 'finish',
    HOLDER_SENT_PAYMENT: 'holder-sent-payment',
    FAIL: 'fail',
};

const DEAL_ROUTES_TO_STATUSES_MAP = {
    [DEAL_STATUSES_ROUTE.UPLOAD]: DEAL_STATUSES_MAP.UPLOADING,
    [DEAL_STATUSES_ROUTE.IN_PROGRESS]: DEAL_STATUSES_MAP.IN_PROGRESS,
    [DEAL_STATUSES_ROUTE.DOWNLOAD]: DEAL_STATUSES_MAP.DOWNLOADING,
    [DEAL_STATUSES_ROUTE.FINISH]: DEAL_STATUSES_MAP.DONE,
};

const STATUSES_TO_CREATE_CONFIRMATION_RECORD_SET = new Set([
    DEAL_STATUSES_MAP.UPLOADING,
    DEAL_STATUSES_MAP.IN_PROGRESS,
    DEAL_STATUSES_MAP.DOWNLOADING,
]);

const IMMUTABLE_STATUSES_LIST = [
    DEAL_STATUSES_MAP.FAILED,
    DEAL_STATUSES_MAP.CANCELLED,
    DEAL_STATUSES_MAP.REJECTED,
];

const FINISHED_STATUSES_LIST = [
    DEAL_STATUSES_MAP.DONE,
    DEAL_STATUSES_MAP.FAILED,
    DEAL_STATUSES_MAP.COMPLETED,
    DEAL_STATUSES_MAP.CANCELLED,
    DEAL_STATUSES_MAP.REJECTED,
    DEAL_STATUSES_MAP.WAIT_TRANSPORTER_PAYMENT,
];

const ACTIVE_STATUSES_LIST = [
    DEAL_STATUSES_MAP.GOING_TO_UPLOADING,
    DEAL_STATUSES_MAP.UPLOADING,
    DEAL_STATUSES_MAP.IN_PROGRESS,
    DEAL_STATUSES_MAP.DOWNLOADING,
];

const IN_WORK_STATUSES_LIST = [
    DEAL_STATUSES_MAP.CONFIRMED,
    DEAL_STATUSES_MAP.GOING_TO_UPLOADING,
    DEAL_STATUSES_MAP.UPLOADING,
    DEAL_STATUSES_MAP.IN_PROGRESS,
    DEAL_STATUSES_MAP.DOWNLOADING,
];

const STATUSES_TO_STORE_DEAL_INSTANCES_SET = new Set([
    DEAL_STATUSES_MAP.GOING_TO_UPLOADING,
    DEAL_STATUSES_MAP.UPLOADING,
    DEAL_STATUSES_MAP.IN_PROGRESS,
    DEAL_STATUSES_MAP.DOWNLOADING,
]);

const ALLOWED_NEXT_STATUSES_MAP = {
    [DEAL_STATUSES_MAP.CREATED]: new Set([
        DEAL_STATUSES_ROUTE.CONFIRM,
        DEAL_STATUSES_ROUTE.CANCEL,
    ]),
    [DEAL_STATUSES_MAP.CONFIRMED]: new Set([
        DEAL_STATUSES_ROUTE.REJECT,
    ]),
    [DEAL_STATUSES_MAP.GOING_TO_UPLOADING]: new Set([
        DEAL_STATUSES_ROUTE.UPLOAD,
        DEAL_STATUSES_ROUTE.FAIL,
    ]),
    [DEAL_STATUSES_MAP.UPLOADING]: new Set([
        DEAL_STATUSES_ROUTE.IN_PROGRESS,
        DEAL_STATUSES_ROUTE.FAIL,
    ]),
    [DEAL_STATUSES_MAP.IN_PROGRESS]: new Set([
        DEAL_STATUSES_ROUTE.DOWNLOAD,
        DEAL_STATUSES_ROUTE.FAIL,
    ]),
    [DEAL_STATUSES_MAP.DOWNLOADING]: new Set([
        DEAL_STATUSES_ROUTE.FINISH,
        DEAL_STATUSES_ROUTE.FAIL,
    ]),
    [DEAL_STATUSES_MAP.DONE]: new Set([
        DEAL_STATUSES_ROUTE.HOLDER_SENT_PAYMENT,
        DEAL_STATUSES_ROUTE.FAIL,
    ]),
};

const REJECTED_STATUES_ROUTES_SET = new Set([
    DEAL_STATUSES_ROUTE.FAIL,
    DEAL_STATUSES_ROUTE.REJECT,
    DEAL_STATUSES_ROUTE.CANCEL,
    DEAL_STATUSES_ROUTE.PROBLEM,
]);

module.exports = {
    DEAL_STATUSES_MAP,
    FINISHED_STATUSES_LIST,
    ALLOWED_NEXT_STATUSES_MAP,
    ACTIVE_STATUSES_LIST,
    IN_WORK_STATUSES_LIST,
    DEAL_STATUSES_ROUTE,
    DEAL_ROUTES_TO_STATUSES_MAP,
    STATUSES_TO_CREATE_CONFIRMATION_RECORD_SET,
    IMMUTABLE_STATUSES_LIST,
    STATUSES_TO_STORE_DEAL_INSTANCES_SET,
    REJECTED_STATUES_ROUTES_SET,
};
