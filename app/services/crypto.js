const bcrypt = require('bcrypt');
const { createCipheriv, createDecipheriv } = require('crypto');

const { ENCRYPT_KEY } = process.env;
const ALGORITHM = 'aes-256-ctr';
const INPUT_ENCODING = 'utf8';
const OUTPUT_ENCODING = 'hex';
const IV = Buffer.alloc(16, 0);

const hashPassword = (password, readySalt) => new Promise(async (resolve, reject) => {
    try {
        const salt = readySalt || await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        resolve({ hash: hashedPassword, key: salt });
    } catch (error) {
        reject(error);
    }
});

const encrypt = value => {
    const cipher = createCipheriv(ALGORITHM, ENCRYPT_KEY, IV);
    const crypted = cipher.update(value, INPUT_ENCODING, OUTPUT_ENCODING);
    return crypted + cipher.final(OUTPUT_ENCODING);
};

const decrypt = value => {
    const decipher = createDecipheriv(ALGORITHM, ENCRYPT_KEY, IV);
    const dec = decipher.update(value, OUTPUT_ENCODING, INPUT_ENCODING);
    return dec + decipher.final(INPUT_ENCODING);
};

module.exports = {
    hashPassword,
    encrypt,
    decrypt,
};
