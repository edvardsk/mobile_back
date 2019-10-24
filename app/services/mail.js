const Nodemailer = require('nodemailer');
const Email = require('email-templates');
const {
    formatConfirmationEmailUrl,
    formatResetPasswordUrl,
} = require('formatters/mail');

const {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USERNAME,
    MAIL_PASSWORD,
} = process.env;

const CONFIRM_EMAIL_TITLE = 'Confirm email';
const RESET_PASSWORD_TITLE = 'Reset password';

const Transporter = Nodemailer.createTransport({
    host: MAIL_HOST,
    port: +MAIL_PORT,
    secure: false,
    auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
    },
});

const sender = new Email({
    transport: Transporter,
    send: true,
    preview: false,
    views: {
        options: {
            extension: 'pug',
        },
        root: 'app/views/email',
    },
});

const sendConfirmationEmail = (email, hash, role) => {
    const config = {
        template: 'confirm-email',
        message: {
            to: email,
        },
        locals: {
            title: CONFIRM_EMAIL_TITLE,
            link: formatConfirmationEmailUrl(hash, role),
        },
    };
    return sender.send(config);
};

const sendResetPasswordEmail = (email, hash) => {
    const config = {
        template: 'reset-password',
        message: {
            to: email,
        },
        locals: {
            title: RESET_PASSWORD_TITLE,
            link: formatResetPasswordUrl(hash),
        },
    };
    return sender.send(config);
};

module.exports = {
    sendConfirmationEmail,
    sendResetPasswordEmail,
};
