
const BASIC_DOCUMENNTS = [
    '\'passport\'', '\'state_registration_certificate\'', '\'insurance_policy\'', '\'residency_certificate\'',
];

exports.up = function(knex) {
    return knex.raw('ALTER TABLE files ALTER "type" type text[] USING string_to_array(type, \',\');')
        .then(function () {
            return knex.raw('ALTER TABLE files RENAME type TO labels;');
        })
        .then(function () {
            return knex.raw(`UPDATE files SET labels = labels || '{basic}' WHERE labels[1] IN (${BASIC_DOCUMENNTS.toString()})`);
        })
        .then(function () {
            return knex.raw(`UPDATE files SET labels = labels || '{custom}' WHERE labels[1] NOT IN (${BASIC_DOCUMENNTS.toString()})`);
        });
};

exports.down = function(knex) {
    return knex.raw('ALTER TABLE files ALTER "type" type character varying(255) USING array_to_string(type, \',\');')
        .then(function () {
            return knex.raw('ALTER TABLE files RENAME labels TO type;');
        });
};
