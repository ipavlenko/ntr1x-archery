const express = require('express');
const config = require('config');

const backend = require('../services/backend')(config.get('viewer.storage'));

const router = express.Router();

router.get('/*', function(req, res, next) {

    let host = req.headers['x-forwarded-host'] || req.headers.host

    backend
        .loadContext({ authorization: req.cookies.authorization, host: host, id: req.params.id  })
        .then(
            (d) => res.render('viewer', { context: d, config: config.get('viewer.storage'), root: '/' }),
            (e) => { next(new Error(e)) }
        )
});

module.exports = router;
