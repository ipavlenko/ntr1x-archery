const request = require('request');

function backend(config) {

    return {

        loadPrincipal: ({ authorization, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!authorization) {
                        reject(null)
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/me/profile`,
                        headers: {
                            'Authorization': authorization,
                            'X-Client-Host': host
                        }
                    }

                    request(target, (error, response, body) => {

                        if (!error && response.statusCode == 200) {

                            resolve({
                                user: JSON.parse(body),
                                token: authorization
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

        loadContext: ({ authorization, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    let target = {
                        url: `${config.endpoint}/context`,
                        headers: {
                            'X-Client-Host': host
                        }
                    }

                    if (authorization) {
                        target.headers['Authorization'] = authorization
                    }

                    request(target, (error, response, body) => {

                        if (!error && response.statusCode == 200) {

                            let d = JSON.parse(body);

                            resolve({
                                principal: {
                                    user: d.user,
                                    token: authorization
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

        loadSpecificContext: ({ authorization, host, id }) => {

            return new Promise(function(resolve, reject) {

                try {

                    let target = {
                        url: `${config.endpoint}/context/i/${id}`,
                        headers: {
                            'X-Client-Host': host
                        }
                    }

                    if (authorization) {
                        target.headers['Authorization'] = authorization
                    }

                    request(target, (error, response, body) => {

                        if (!error && response.statusCode == 200) {

                            let d = JSON.parse(body);

                            resolve({
                                principal: {
                                    user: d.user,
                                    token: authorization
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

        loadSharedPortals: ({ host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    let target = {
                        url: `${config.endpoint}/portals/shared`,
                        qs: {
                            size: 3
                        },
                        headers: {
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

        loadPortal: ({ id, authorization, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!authorization) {
                        reject()
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/portals/i/${id}`,
                        headers: {
                            'Authorization': authorization,
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

        loadPortalContent: ({ id, authorization, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!authorization) {
                        reject()
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/portals/i/${id}/pull`,
                        headers: {
                            'Authorization': authorization,
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

        execSignupConfirm: ({ token, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!token) {
                        reject()
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/security/signup/confirm/${token}`,
                        headers: {
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

        execEmailConfirm: ({ token, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!token) {
                        reject()
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/security/email/confirm/${token}`,
                        headers: {
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

        execRecoverConfirm: ({ token, host }) => {

            return new Promise(function(resolve, reject) {

                try {

                    if (!token) {
                        reject()
                        return
                    }

                    let target = {
                        url: `${config.endpoint}/security/recover/confirm/${token}`,
                        headers: {
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
