const DANGER_CLASSES = [
    {
        class: null,
        name: 'not_dangerous',
    },
];

exports.up = function(knex) {
    return knex.raw('ALTER TABLE danger_classes ALTER COLUMN class DROP NOT NULL;')
        .then(function () {
            return knex.schema.alterTable('danger_classes', function(table) {
                table.unique('name');
            });
        })
        .then(function () {
            return knex.batchInsert('danger_classes', DANGER_CLASSES);
        });
};

exports.down = function(knex) {
    return Promise.all(DANGER_CLASSES.map(dangerClass => (
        knex('danger_classes')
            .where('name', dangerClass.name)
            .del()
    )))
        .then(function () {
            return knex.raw('ALTER TABLE danger_classes ALTER COLUMN class SET NOT NULL;');
        });
};
