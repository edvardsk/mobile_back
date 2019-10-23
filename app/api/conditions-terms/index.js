const express = require('express');
const { ROUTES } = require('constants/routes');
const get = require('./get');
const post = require('./post');

// middlewares
const { isHasPermissions } = require('api/middlewares');
const { validateFileType } = require('api/middlewares/validator');

// constants
const { PERMISSIONS } = require('constants/system');
const { FILES_TYPES } = require('constants/files');

const router = express.Router();

const GET_CONDITIONS_AND_TERMS_PERMISSIONS = [
    PERMISSIONS.FINISH_REGISTRATION,
    PERMISSIONS.REGISTRATION_SAVE_STEP_5,
];

const POST_CONDITIONS_AND_TERMS_PERMISSIONS = [
    // todo: add admin permissions
];

router.get(
    ROUTES.CONDITIONS_TERMS.GET,
    isHasPermissions(GET_CONDITIONS_AND_TERMS_PERMISSIONS),
    get.getConditionsTerms
);

router.post(
    ROUTES.CONDITIONS_TERMS.POST,
    isHasPermissions(POST_CONDITIONS_AND_TERMS_PERMISSIONS),
    validateFileType([FILES_TYPES.DOCX]),
    post.addConditionsTerms
);

module.exports = router;
