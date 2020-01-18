const { get } = require('lodash');
const { match } = require('path-to-regexp');
const { reject } = require('api/response');

// services
const TokenService = require('services/token');
const UsersService = require('services/tables/users');

// constants
const { ERRORS } = require('constants/errors');
const { ALLOWED_ROUTES } = require('constants/routes');

// helpers
const { extractToken } = require('helpers');
const { isValidUUID } = require('helpers/validators');

const isAllowedRoute = req => {
    const url = req.baseUrl;

    const GET_ARRAY = Array.from(ALLOWED_ROUTES.GET);

    return (req.method === 'GET' && GET_ARRAY.some(route => { // todo: refactor it
        const regexp = match(route);
        return !!regexp(url);
    })) ||
        (req.method === 'POST' && ALLOWED_ROUTES.POST.has(req.baseUrl)) ||
        (req.method === 'PUT' && ALLOWED_ROUTES.PUT.has(req.baseUrl)) ||
        (req.method === 'DELETE' && ALLOWED_ROUTES.DELETE.has(req.baseUrl));
};

const isAuthenticated = async (req, res) => {
    if (isAllowedRoute(req)) {
        return req.next();
    } else {
        try {
            const token = extractToken(req);
            const isTokenValid = TokenService.verifyJWToken(token);
            const decodedData = TokenService.decodeJWToken(token);
            const userId = get(decodedData, 'id');

            if (!isValidUUID(userId) || !isTokenValid) {
                return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN);
            }

            const user = await UsersService.getUser(userId); // todo: remove extra joins

            if (!user) {
                return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN);
            }

            res.locals.user = user;

            return req.next();
        } catch (error) {
            logger.error(error);
            if (error.name === 'TokenExpiredError') {
                return reject(res, ERRORS.AUTHENTICATION.EXPIRED_TOKEN);
            }
            return reject(res, ERRORS.AUTHENTICATION.INVALID_TOKEN, error);
        }
    }
};

const injectNotRequiredUser = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (token) {
            const decodedData = TokenService.decodeJWToken(token);
            const userId = get(decodedData, 'id');

            if (isValidUUID(userId)) {
                const user = await UsersService.getUser(userId);
                if (user) {
                    res.locals.user = user;
                }
            }
        }

        return next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    isAuthenticated,
    injectNotRequiredUser,
};
