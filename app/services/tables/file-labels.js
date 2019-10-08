const { manyOrNone } = require('db');
const {
    selectLabels,
} = require('sql-helpers/file-labels');

const getLabels = () => manyOrNone(selectLabels());

module.exports = {
    getLabels,
};
