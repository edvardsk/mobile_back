const CARGO_STATUSES_MAP = {
    NEW: 'new',
    AWAIT_CONFIRMATION: 'await_confirmation',
    CONFIRMED: 'confirmed',
    MATCHING: 'matching',
    AGREED: 'agreed',
    IN_ROAD: 'in_road',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    PROBLEM: 'problem',
};

const CARGO_STATUSES = Object.values(CARGO_STATUSES_MAP);

module.exports = {
    CARGO_STATUSES_MAP,
    CARGO_STATUSES,
};
