const express = require('express');
const backend = require('../services/backend');
const config = require('config');

const router = express.Router();

router.get('/edit/:id', function(req, res) {

    Promise.all([
        backend.loadPrincipal({ token: req.cookies.token }),
        backend.loadPortal({ token: req.cookies.token, id: req.params.id }),
        backend.loadPortalContent({ token: req.cookies.token, id: req.params.id }),
    ])
        .then(
            ([ principal, portal, content ]) => res.render('designer', { principal, portal, content, config: config.get('public') }),
            (e) => { throw new Error(e) }
        )
});

router.get('/view/:id', function(req, res) {

    Promise.all([
        backend.loadPrincipal({ token: req.cookies.token }),
        backend.loadPortal({ token: req.cookies.token, id: req.params.id }),
        backend.loadPortalContent({ token: req.cookies.token, id: req.params.id }),
    ])
        .then(
            ([ principal, portal, content ]) => res.render('designer', { principal, portal, content, config: config.get('public') }),
            (e) => { throw new Error(e) }
        )
});

router.get('/*', function(req, res) {

    Promise.all([
        backend.loadPrincipal({ token: req.cookies.token }).catch(() => Promise.resolve({ user: null, token: null })),
        backend.loadSharedPortals().catch(() => new Promise(null))
    ])
        .then(
            ([ principal, shared ]) => res.render('landing', { principal, shared, config: config.get('public') }),
            (e) => { throw new Error(e) }
        )
});

module.exports = router;
