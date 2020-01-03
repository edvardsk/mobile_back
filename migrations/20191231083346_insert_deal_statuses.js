const STATUSES_TO_ADD = [
    'cancelled',
    'rejected',
].map(name => ({
    name
}));

const STATUSES_TO_DELETE = [
    'problem',
].map(name => ({
    name
}));

exports.up = function(knex) {
    return knex.batchInsert('deal_statuses', STATUSES_TO_ADD)
        .then(function () {
            return Promise.all(STATUSES_TO_DELETE.map(({ name }) => (
                knex('deal_statuses')
                    .where('name', name)
                    .del()
            )));
        })
        .then(function () {
            return knex.schema.alterTable('deal_history_statuses', function(table) {
                table.text('comment');
            });
        });
};

exports.down = function(knex) {
    return Promise.all(STATUSES_TO_ADD.map(({ name }) => (
        knex('deal_statuses')
            .where('name', name)
            .del()
    )))
        .then(function () {
            return knex.batchInsert('deal_statuses', STATUSES_TO_DELETE);
        })
        .then(function () {
            return knex.schema.alterTable('deal_history_statuses', function(table) {
                table.dropColumn('comment');
            });
        });
};
