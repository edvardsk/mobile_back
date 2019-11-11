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

const POST_CONDITIONS_AND_TERMS_PERMISSIONS = [
    PERMISSIONS.MODIFY_CONDITIONS_AND_TERMS,
];

router.get(
    ROUTES.CONDITIONS_TERMS.GET,
    isHasPermissions([PERMISSIONS.REGISTRATION_SAVE_STEP_5], [PERMISSIONS.READ_CONDITIONS_AND_TERMS]),
    get.getConditionsTerms
);

router.post(
    ROUTES.CONDITIONS_TERMS.POST,
    isHasPermissions(POST_CONDITIONS_AND_TERMS_PERMISSIONS),
    validateFileType([FILES_TYPES.DOCX]),
    post.addConditionsTerms
);

module.exports = router;
