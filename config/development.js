module.exports = {
    server: {
        port: 3000,
        name: 'ntr1x-archery:server',
        storage: {
            endpoint: 'http://storage.ntr1x.com',
        }
    },
    viewer: {
        port: 3001,
        name: 'ntr1x-archery:viewer',
        storage: {
            endpoint: 'http://storage.ntr1x.com',
        }
    },
}
