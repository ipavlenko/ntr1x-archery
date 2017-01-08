module.exports = {
    instance: {
        platform: {
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
            domain: 'archery.ntr1x.com',
        },
        public: {
            endpoint: 'http://storage.ntr1x.com',
            domain: 'archery.ntr1x.com',
        }
    }
}
