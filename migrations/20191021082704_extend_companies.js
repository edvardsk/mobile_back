
exports.up = function(knex) {
    return knex.schema.alterTable('companies', function(table) {
        table.string('ownership_type', 50);
        table.string('website');
        table.timestamp('registered_at');
        table.uuid('country_id').references('countries.id').notNull();
        table.string('identity_number', 12).unique().notNull();
        table.string('legal_address');
        table.string('settlement_account', 29).unique();
        table.string('post_address');
        table.string('bank_name');
        table.string('head_company_full_name');
        table.string('bank_address');
        table.string('bank_code', 9);
        table.string('contract_signer_full_name');

        table.dropColumn('description');
        table.dropColumn('user_id');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('companies', function (table) {
        table.dropColumn('ownership_type');
        table.dropColumn('website');
        table.dropColumn('registered_at');
        table.dropColumn('country_id');
        table.dropColumn('identity_number');
        table.dropColumn('legal_address');
        table.dropColumn('settlement_account');
        table.dropColumn('post_address');
        table.dropColumn('bank_name');
        table.dropColumn('head_company_full_name');
        table.dropColumn('bank_address');
        table.dropColumn('bank_code');
        table.dropColumn('contract_signer_full_name');

        table.text('description');
        table.uuid('user_id').references('users.id').unique();
    });
};
