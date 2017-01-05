const express = require('express');
const backend = require('../services/backend');
const config = require('config');

const router = express.Router();

router.get('/edit/:id', function(req, res, next) {

    Promise.all([
        backend.loadPrincipal({ token: req.cookies.token }),
        backend.loadPortalContent({ token: req.cookies.token, id: req.params.id }),
    ])
        .then(
            ([ principal, model ]) => res.render('designer', { principal, model, config: config.get('public') }),
            (e) => { next(new Error(e)) }
        )
});

router.get('/view/:id', function(req, res, next) {

    Promise.all([
        backend.loadPrincipal({ token: req.cookies.token }),
        backend.loadPortalContent({ token: req.cookies.token, id: req.params.id }),
    ])
        .then(
            ([ principal, model ]) => res.render('viewer', { principal, model, config: config.get('public') }),
            (e) => { next(new Error(e)) }
        )
});

router.get('/*', function(req, res, next) {

    Promise.all([
        backend.loadPrincipal({ token: req.cookies.token }).catch(() => Promise.resolve({ user: null, token: null })),
        backend.loadSharedPortals().catch(() => new Promise(null))
    ])
        .then(
            ([ principal, shared ]) => res.render('landing', { principal, shared, config: config.get('public') }),
            (e) => { next(new Error(e)) }
        )
});

module.exports = router;
