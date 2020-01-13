
exports.up = function(knex) {
    return knex.schema.createTable('deal_companies_info', function(table) {
        table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary().unique();
        table.string('name');
        table.string('website');
        table.date('registered_at');
        table.uuid('country_id');
        table.string('identity_number');
        table.string('legal_address');
        table.string('settlement_account');
        table.string('post_address');
        table.string('bank_name');
        table.string('head_company_full_name');
        table.string('bank_address');
        table.string('bank_code');
        table.string('contract_signer_full_name');
        table.string('state_registration_certificate_number');
        table.date('state_registration_certificate_created_at');
        table.string('insurance_company_name');
        table.date('insurance_policy_created_at');
        table.date('insurance_policy_expired_at');
        table.date('residency_certificate_created_at');
        table.date('residency_certificate_expired_at');
        table.string('insurance_policy_number');
        table.uuid('bank_country_id');
        table.specificType('legal_city_coordinates', 'geography');
        table.uuid('head_role_id');
        table.timestamp('created_at').defaultTo(knex.fn.now());
    })
        .then(function () {
            return knex.schema.alterTable('deals', function(table) {
                table.uuid('transporter_company_info').references('deal_companies_info.id');
                table.uuid('holder_company_info').references('deal_companies_info.id');
            });
        });
};

exports.down = function(knex) {
    return knex.schema.alterTable('deals', function(table) {
        table.dropColumn('transporter_company_info');
        table.dropColumn('holder_company_info');
    })
        .then(function () {
            return knex.schema.dropTable('deal_companies_info');
        });
};
