module.exports = {
    instance: {
        server: {
            port: 3000,
            name: 'ntr1x-archery:engine'
        },
        viewer: {
            port: 3001,
            name: 'ntr1x-archery:viewer'
        }
    },
    storage: {
        local: {
            endpoint: 'http://storage.ntr1x.com',
            host: 'localhost:3000',
        },
        public: {
            endpoint: 'http://storage.ntr1x.com',
            host: 'localhost:3000',
        }
    }
}
