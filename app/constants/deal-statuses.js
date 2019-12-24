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
};

const FINISHED_STATUSES_LIST = [
    DEAL_STATUSES_MAP.DONE,
    DEAL_STATUSES_MAP.FAILED,
    DEAL_STATUSES_MAP.COMPLETED,
];

const SEARCHABLE_STATUSES_LIST = [
    DEAL_STATUSES_MAP.CREATED,
    ...FINISHED_STATUSES_LIST,
];

module.exports = {
    DEAL_STATUSES_MAP,
    FINISHED_STATUSES_LIST,
    SEARCHABLE_STATUSES_LIST,
};
