
const PERMISSIONS = [
    {
        id: '1d88e469-2591-42db-84d2-01096d8f0887',
        name: 'registration_save_step_1'
    },
    {
        id: 'b840320c-60da-4bfd-9df0-6b8a449d7431',
        name: 'registration_save_step_2',
    },
    {
        id: 'b96f79fe-d318-4ace-8579-c6259bfb92d8',
        name: 'registration_save_step_3',
    },
    {
        id: '0ba0997e-9b26-479d-af6f-d245a07b2be0',
        name: 'registration_save_step_4',
    },
    {
        id: 'bb703a80-5e38-4f08-95c4-ec2e32a620bc',
        name: 'registration_save_step_5',
    }
];

exports.up = function(knex) {
    return knex.batchInsert('permissions', PERMISSIONS);
};

exports.down = function(knex) {
    return Promise.all(PERMISSIONS.map(permission => (
        knex('permissions')
            .where('id', permission.id)
            .del()
    )));
};
