const express = require('express');
const config = require('config');

const backend = require('../services/backend')(config.get('server.storage'));

const router = express.Router();

router.get('/edit/:id', function(req, res, next) {

    backend
        .loadSpecificContext({ token: req.cookies.token, id: req.params.id })
        .then(
            (d) => res.render('designer', { context: d, config: config.get('server.storage'), root: `/edit/${req.params.id}/` }),
            (e) => { next(new Error(e)) }
        )
});

router.get('/view/:id', function(req, res, next) {

    backend
        .loadSpecificContext({ token: req.cookies.token, id: req.params.id  })
        .then(
            (d) => res.render('viewer', { context: d, config: config.get('server.storage'), root: `/view/${req.params.id}/` }),
            (e) => { next(new Error(e)) }
        )
});

router.get('/*', function(req, res, next) {

    Promise.all([
        backend.loadPrincipal({ token: req.cookies.token, host: req.headers.host }).catch(() => Promise.resolve({ user: null, token: null })),
        backend.loadSharedPortals().catch(() => new Promise(null))
    ])
        .then(
            ([ principal, shared ]) => res.render('landing', { principal, shared, config: config.get('server.storage') }),
            (e) => { next(new Error(e)) }
        )
});

module.exports = router;
