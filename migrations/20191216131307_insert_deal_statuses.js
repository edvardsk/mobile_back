const STATUSES = [
    'confirmed',
    'going_to_uploading',
    'uploading',
    'in_progress',
    'downloading',
    'done',
    'failed',
    'completed',
].map(name => ({
    name
}));

exports.up = function(knex) {
    return knex.batchInsert('deal_statuses', STATUSES)
        .then(function () {
            return knex.schema.alterTable('deal_statuses', function(t) {
                t.unique('name');
            });
        });
};

exports.down = function(knex) {
    return Promise.all(STATUSES.map(({ name }) => (
        knex('deal_statuses')
            .where('name', name)
            .del()
    )))
        .then(function () {
            return knex.schema.alterTable('deal_statuses', function(t) {
                t.dropUnique('name');
            });
        });
};
