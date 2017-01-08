const express = require('express');
const config = require('config');

const backend = require('../services/backend')(config.get('viewer.storage'));

const router = express.Router();

router.get('/*', function(req, res, next) {

    backend
        .loadContext({ token: req.cookies.token, host: req.headers.host, id: req.params.id  })
        .then(
            (d) => res.render('viewer', { context: d, config: config.get('viewer.storage'), root: '/' }),
            (e) => { next(new Error(e)) }
        )
});

module.exports = router;
