/* eslint-disable */

const cargo = {
    company_id: '3bd2aa64-b4c5-43a8-b19f-1feff7ba907f',
    status_id: '952f8ac8-2e2d-4b9e-a3f4-2c9eeb6a15a5',
    uploading_date_from: '2019-12-22',
    uploading_date_to: '2019-12-25',
    downloading_date_from: '2019-12-29',
    downloading_date_to: '2019-12-31',
    gross_weight: 2,
    width: 2,
    height: 2,
    length: 2,
    loading_methods: '{up}',
    guarantees: '{TIR}',
    loading_type: 'LTL',
    danger_class_id: 'e9189b6a-e8a5-4fa1-a9c0-b0301ae8f6a6',
    vehicle_type_id: '18bd58dd-ab4a-4aec-bec9-cb7078eae299',
};

const cargos = Array(10000).fill(1).map(() => ({
    ...cargo,
}));

exports.seed = async function(knex) {
    return knex.batchInsert('cargos', cargos)
};
