
exports.up = function(knex) {
    return knex.schema.alterTable('companies', function(table) {
        table.string('legal_address');
        table.string('settlement_account', 29).unique();
        table.string('post_address');
        table.string('bank_name');
        table.string('head_company_full_name');
        table.string('bank_address');
        table.string('bank_code', 9);
        table.string('contract_signer_full_name');
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('companies', function (table) {
        table.dropColumn('legal_address');
        table.dropColumn('settlement_account');
        table.dropColumn('post_address');
        table.dropColumn('bank_name');
        table.dropColumn('head_company_full_name');
        table.dropColumn('bank_address');
        table.dropColumn('bank_code');
        table.dropColumn('contract_signer_full_name');
    });
};
