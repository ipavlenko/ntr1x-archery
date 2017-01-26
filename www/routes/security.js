const express = require('express');
const config = require('config');

const backend = require('../services/backend')(config.get('server.storage'));

const router = express.Router();

router.get('/signup/confirm/:token', function(req, res, next) {

    let host = req.headers['x-forwarded-host'] || req.headers.host

    backend
        .execSignupConfirm({ host: host, token: req.params.token })
        .then(
            (d) => {
                res.cookie('authorization', d.token, { maxAge: 365 * 24 * 3600 * 1000 })
                res.redirect('/signup/success')
            },
            (e) => { next(new Error(e)) }
        )
});

router.get('/email/confirm/:token', function(req, res, next) {

    let host = req.headers['x-forwarded-host'] || req.headers.host

    backend
        .execEmailConfirm({ host: host, token: req.params.token })
        .then(
            (d) => {
                res.cookie('authorization', d.token, { maxAge: 365 * 24 * 3600 * 1000 })
                res.redirect('/profile/email/success')
            },
            (e) => { next(new Error(e)) }
        )
});

router.get('/recover/confirm/:token', function(req, res, next) {

    let host = req.headers['x-forwarded-host'] || req.headers.host

    backend
        .execRecoverConfirm({ host: host, token: req.params.token })
        .then(
            (d) => {
                res.redirect(`/recover/passwd/${d.passwdToken}`)
            },
            (e) => { next(new Error(e)) }
        )
});

module.exports = router;
