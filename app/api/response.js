const { ERROR_CODES, SUCCESS_CODES } = require('constants/http-codes');

const success = (res, data, code = SUCCESS_CODES.OK) => {
    const result = {
        data,
    };

    res.status(code).send(result);
};

const reject = (res, type, error = '', code = ERROR_CODES.BAD_REQUEST) => {
    const result = {
        error: {
            type: type || '',
            message: error.message || error,
            data: error.data || '',
        },
    };

    res.status(code).send(result);
};

module.exports = {
    success,
    reject,
};
