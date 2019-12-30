const STATUSES = [
    'problem',
].map(name => ({
    name
}));

exports.up = function(knex) {
    return knex.batchInsert('deal_statuses', STATUSES);
};

exports.down = function(knex) {
    return Promise.all(STATUSES.map(({ name }) => (
        knex('deal_statuses')
            .where('name', name)
            .del()
    )));
};
