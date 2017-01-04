const request = require('request');
const config = require('config');

const local = config.get('local');

console.log(local)

const backend = {

    loadPrincipal: ({ token }) => {

        return new Promise(function(resolve, reject) {

            if (!token) {
                reject(null)
                return
            }

            let target = {
                url: `${local.endpoint}/me/profile`,
                headers: {
                    Authorization: token
                }
            }

            request(target, (error, response, body) => {

                if (!error && response.statusCode == 200) {

                    resolve({
                        user: JSON.parse(body),
                        token: token
                    })
                    return

                }

                reject(null)
                return
            })
        })
    },

    loadSharedPortals: () => {

        return new Promise(function(resolve, reject) {

            let target = {
                url: `${local.endpoint}/portals/shared`,
                qs: {
                    size: 3
                }
            }

            request(target, (error, response, body) => {

                if (!error && response.statusCode == 200) {

                    resolve(JSON.parse(body))
                    return
                }

                reject()
                return
            })
        });
    },

    loadPortal: ({ id, token }) => {

        return new Promise(function(resolve, reject) {

            if (!token) {
                reject()
                return
            }

            let target = {
                url: `${local.endpoint}/portals/i/${id}`,
                headers: {
                    Authorization: token
                }
            }

            request(target, (error, response, body) => {

                if (!error && response.statusCode == 200) {

                    resolve(JSON.parse(body))
                    return

                }

                reject()
                return
            })
        });
    },

    loadPortalContent: ({ id, token }) => {

        return new Promise(function(resolve, reject) {

            if (!token) {
                reject()
                return
            }

            let target = {
                url: `${local.endpoint}/portals/i/${id}/pull`,
                headers: {
                    Authorization: token
                }
            }

            request(target, (error, response, body) => {

                if (!error && response.statusCode == 200) {

                    resolve(JSON.parse(body))
                    return

                }

                reject()
                return
            })
        });
    },
}

module.exports = backend;
