const DANGER_CLASSES = [
    {
        class: 1,
        name: 'explosives',
    },
    {
        class: 2,
        name: 'gases',
    },
    {
        class: 3,
        name: 'flammable_liquids',
    },
    {
        class: 4,
        subclass: 1,
        name: 'flammable_solids',
    },
    {
        class: 4,
        subclass: 2,
        name: 'self_igniting_substances',
    },
    {
        class: 4,
        subclass: 3,
        name: 'emit_flammable_gases_after_water',
    },
    {
        class: 5,
        subclass: 1,
        name: 'oxidizing_substances',
    },
    {
        class: 5,
        subclass: 2,
        name: 'organic_peroxides',
    },
    {
        class: 6,
        subclass: 1,
        name: 'toxic_substances',
    },
    {
        class: 6,
        subclass: 2,
        name: 'infectious_substances',
    },
    {
        class: 7,
        name: 'radioactive_materials',
    },
    {
        class: 8,
        name: 'corrosives',
    },
    {
        class: 9,
        name: 'others',
    },
];

const VEHICLE_TYPES = [
    'single_tier_refrigerator',
    'two_tier_refrigerator',
    'isotherm',
    'auto_coupler',
    'jumbo',
    'container_ship',
    'awning',
    'oversized_platform',
    'open_airborne_platform',
    'open_platform',
    'tank_truck',
    'car_transporter',
].map(name => ({
    name
}));

exports.up = function(knex) {
    return knex.schema.createTable('danger_classes', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.integer('class').notNull();
        table.integer('subclass');
        table.string('name').notNull();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.unique(['class', 'subclass']);
    })
        .then(function () {
            return Promise.all([
                knex.raw('ALTER TABLE danger_classes ADD CONSTRAINT class_check CHECK (class >= 0 AND class <= 9)'),
                knex.raw('ALTER TABLE danger_classes ADD CONSTRAINT subclass_check CHECK (subclass >= 0 AND subclass <= 6)'),
            ]);
        })
        .then(function () {
            return knex.schema.createTable('vehicle_types', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.string('name').notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.unique('name');
            });
        })
        .then(function () {
            return knex.schema.createTable('cargos', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('company_id').references('companies.id').notNull();
                table.timestamp('uploading_date_from').notNull();
                table.timestamp('uploading_date_to');
                table.timestamp('downloading_date_from').notNull();
                table.timestamp('downloading_date_to');
                table.float('gross_weight').notNull();
                table.float('width').notNull();
                table.float('height').notNull();
                table.float('length').notNull();
                table.specificType('loading_methods', 'text[]').notNull();
                table.specificType('guarantees', 'text[]').notNull();
                table.string('loading_type', 50).notNull();
                table.uuid('danger_class_id').references('danger_classes.id');
                table.uuid('vehicle_type_id').references('vehicle_types.id');
                table.text('packing_description');
                table.text('description');
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        })
        .then(function () {
            return knex.schema.createTable('cargo_points', function(table) {
                table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
                table.uuid('cargo_id').references('cargos.id').notNull();
                table.specificType('coordinates', 'geography').notNull();
                table.string('type', 50).notNull();
                table.timestamp('created_at').defaultTo(knex.fn.now());
            });
        })
        .then(function () {
            return knex.batchInsert('danger_classes', DANGER_CLASSES);
        })
        .then(function () {
            return  knex.batchInsert('vehicle_types', VEHICLE_TYPES);
        });
};

exports.down = function(knex) {
    return knex.schema.dropTable('cargo_points')
        .then(function () {
            return knex.schema.dropTable('cargos');
        })
        .then(function () {
            return knex.schema.dropTable('vehicle_types');
        })
        .then(function () {
            return knex.schema.dropTable('danger_classes');
        });
};
