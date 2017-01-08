const request = require('request');

function backend(config) {

    return {

        loadPrincipal: ({ token, host }) => {

            console.log('!!!token', token);
            console.log('!!!host', host);
            

            return new Promise(function(resolve, reject) {

                try {

                    if (!token) {
                        reject(null)
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/me/profile`,
                        headers: {
                            'Authorization': token,
                            'X-Client-Host': host
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

                } catch (e) {

                    reject(e)
                    return
                }
            })
        },

        loadContext: ({ token, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!token) {
                        reject(null)
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/context`,
                        headers: {
                            'Authorization': token,
                            'X-Client-Host': host
                        }
                    }

                    request(target, (error, response, body) => {

                        if (!error && response.statusCode == 200) {

                            let d = JSON.parse(body);

                            resolve({
                                principal: {
                                    user: d.user,
                                    token: token
                                },
                                portal: d.portal,
                                content: d.content
                            })
                            return

                        }

                        reject(null)
                        return
                    })

                } catch (e) {

                    reject(e)
                    return
                }
            })
        },

        loadSpecificContext: ({ token, host, id }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!token) {
                        reject(null)
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/context/i/${id}`,
                        headers: {
                            'Authorization': token,
                            'X-Client-Host': host
                        }
                    }

                    request(target, (error, response, body) => {

                        if (!error && response.statusCode == 200) {

                            let d = JSON.parse(body);

                            resolve({
                                principal: {
                                    user: d.user,
                                    token: token
                                },
                                portal: d.portal,
                                content: d.content
                            })
                            return

                        }

                        reject(null)
                        return
                    })

                } catch (e) {

                    reject(e)
                    return
                }
            })
        },

        loadSharedPortals: () => {

            return new Promise(function(resolve, reject) {

                try {

                    let target = {
                        url: `${config.endpoint}/portals/shared`,
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

                } catch (e) {

                    reject(e)
                    return
                }
            });
        },

        loadPortal: ({ id, token, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!token) {
                        reject()
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/portals/i/${id}`,
                        headers: {
                            'Authorization': token,
                            'X-Client-Host': host
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

                } catch (e) {

                    reject(e)
                    return
                }
            });
        },

        loadPortalContent: ({ id, token, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!token) {
                        reject()
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/portals/i/${id}/pull`,
                        headers: {
                            'Authorization': token,
                            'X-Client-Host': host
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

                } catch (e) {

                    reject(e)
                    return
                }
            });
        },
    }
}

module.exports = backend;
