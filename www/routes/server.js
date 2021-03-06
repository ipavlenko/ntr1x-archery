const express = require('express');
const config = require('config');

const backend = require('../services/backend')(config.get('server.storage'));

const router = express.Router();

router.get('/edit/:id/*', function(req, res, next) {

    let host = req.headers['x-forwarded-host'] || req.headers.host

    backend
        .loadSpecificContext({ authorization: req.cookies.authorization, host: host, id: req.params.id })
        .then(
            (d) => res.render('designer', { context: d, config: config.get('server.storage'), root: `/edit/${req.params.id}/` }),
            (e) => { next(new Error(e)) }
        )
});

router.get('/edit/:id', function(req, res) {
    res.redirect(`/edit/${req.params.id}/`);
});

router.get('/view/:id/*', function(req, res, next) {

    let host = req.headers['x-forwarded-host'] || req.headers.host

    backend
        .loadSpecificContext({ authorization: req.cookies.authorization, host: host, id: req.params.id  })
        .then(
            (d) => res.render('viewer', { context: d, config: config.get('server.storage'), root: `/view/${req.params.id}/` }),
            (e) => { next(new Error(e)) }
        )
});

router.get('/view/:id', function(req, res) {
    res.redirect(`/view/${req.params.id}/`);
});

router.get('/*', function(req, res, next) {

    let host = req.headers['x-forwarded-host'] || req.headers.host

    Promise.all([
        backend.loadPrincipal({ authorization: req.cookies.authorization, host: host }).catch(() => Promise.resolve({ user: null, token: null })),
        backend.loadSharedPortals({ host: host }).catch(() => new Promise(null)),
        backend.loadOffers({ host: host }).catch(() => new Promise(null))
    ])
        .then(
            ([ principal, shared, offers ]) => res.render('landing', { principal, shared, offers, config: config.get('server.storage') }),
            (e) => { next(new Error(e)) }
        )
});

module.exports = router;
