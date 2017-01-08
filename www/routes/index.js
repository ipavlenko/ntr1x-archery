const express = require('express');
const backend = require('../services/backend');
const config = require('config');

const router = express.Router();

router.get('/edit/:id', function(req, res, next) {

    backend
        .loadContext({ token: req.cookies.token })
        .then(
            (d) => res.render('designer', { context: d, config: config.get('storage.public') }),
            (e) => { next(new Error(e)) }
        )
});

router.get('/view/:id', function(req, res, next) {

    backend
        .loadContext({ token: req.cookies.token })
        .then(
            (d) => res.render('viewer', { context: d, config: config.get('storage.public') }),
            (e) => { next(new Error(e)) }
        )
});

router.get('/*', function(req, res, next) {

    Promise.all([
        backend.loadPrincipal({ token: req.cookies.token }).catch(() => Promise.resolve({ user: null, token: null })),
        backend.loadSharedPortals().catch(() => new Promise(null))
    ])
        .then(
            ([ principal, shared ]) => res.render('landing', { principal, shared, config: config.get('storage.public') }),
            (e) => { next(new Error(e)) }
        )
});

module.exports = router;
