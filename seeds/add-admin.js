/* eslint-disable */
const uuid = require('uuid/v4');

// services
const CryptService = require('../app/services/crypto');

exports.seed = async function(knex) {
    try {
        const [fullName, email, password, prefixCode, phoneNumber] = process.argv.slice(4);
        const { hash, key } = await CryptService.hashPassword(password);
        const userId = uuid();

        const prefixCodeObject = await knex('phone_prefixes')
            .select()
            .where('code', prefixCode)
            .first();

        const adminRoleObject = await knex('roles')
            .select()
            .where('name', 'admin')
            .first();

        const userInfo = {
            id: userId,
            full_name: fullName,
            email: email,
            password: hash,
            key,
        };

        const phoneNumberInfo = {
            user_id: userId,
            phone_prefix_id: prefixCodeObject.id,
            number: phoneNumber,
        };

        const usersToRolesInfo = {
            user_id: userId,
            role_id: adminRoleObject.id,
        };

        return knex.transaction(function(trx) {
            knex('users').transacting(trx).insert(userInfo)
                .then(function() {
                    return knex('users_to_roles').transacting(trx).insert(usersToRolesInfo);
                })
                .then(function () {
                    return knex('phone_numbers').transacting(trx).insert(phoneNumberInfo);
                })
                .then(trx.commit)
                .catch(trx.rollback);
        })
            .then(function() {
                console.log('Transaction complete.');
            })
            .catch(function(err) {
                console.error(err);
            });
    } catch (error) {
        console.error(error);
    }
};
