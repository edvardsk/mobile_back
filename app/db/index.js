const pgPromise = require('pg-promise');
const dotenv = require('dotenv');

dotenv.config();

const pgp = pgPromise();

const dbUrl = process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const db = pgp(dbUrl);

const many = query => {
    return db.many(query);
};

const one = query => {
    return db.one(query);
};

const none = query => {
    return db.none(query);
};

const oneOrNone = query => {
    return db.oneOrNone(query);
};

const manyOrNone = query => {
    return db.manyOrNone(query);
};

const tx = func => {
    return db.tx(func);
};

module.exports = {
    dbUrl,
    many,
    one,
    none,
    oneOrNone,
    manyOrNone,
    tx,
};
