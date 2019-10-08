const { tx } = require('db');

const runTransaction = operations => tx(t => {
    return t.batch(operations.map(([operation, type]) => t[type](operation)));
});

module.exports = {
    runTransaction,
};
