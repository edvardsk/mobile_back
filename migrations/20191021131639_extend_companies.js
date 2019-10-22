
exports.up = function(knex) {
    return knex.schema.alterTable('companies', function(table) {
        table.string('state_registration_certificate_number', 30);
        table.timestamp('state_registration_certificate_created_at');
        table.string('insurance_company_name');
        table.timestamp('insurance_policy_created_at');
        table.timestamp('insurance_policy_expired_at');
        table.timestamp('residency_certificate_created_at');
        table.timestamp('residency_certificate_expired_at');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('companies', function (table) {
        table.dropColumn('state_registration_certificate_number');
        table.dropColumn('state_registration_certificate_created_at');
        table.dropColumn('insurance_company_name');
        table.dropColumn('insurance_policy_created_at');
        table.dropColumn('insurance_policy_expired_at');
        table.dropColumn('residency_certificate_created_at');
        table.dropColumn('residency_certificate_expired_at');
    });
};
