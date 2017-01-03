const express = require('express');
const request = require('request');

const router = express.Router();

router.get('/*', function(req, res) {

    let principal = {
        user: null,
        token: null
    }

    new Promise((resolve) => {

        if (req.cookies.token) {

            let target = {
                url: 'http://api.storage.tp.ntr1x.com/me/profile',
                headers: {
                    Authorization: req.cookies.token
                }
            }

            request(target, (error, response, body) => {

                if (!error && response.statusCode == 200) {

                    Object.assign(principal, {
                        user: JSON.parse(body),
                        token: req.cookies.token
                    })
                }

                resolve(principal)
            })

        } else {

            resolve(principal)
        }
    })
    .then(
        () => res.render('landing', { principal: principal }),
        () => res.render('landing', { principal: principal })
    )
});

module.exports = router;
