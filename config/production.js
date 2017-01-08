module.exports = {
    server: {
        port: 3000,
        name: 'ntr1x-archery:engine',
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
    editor: {
        port: 3002,
        name: 'ntr1x-archery:editor',
        storage: {
            endpoint: 'http://storage.ntr1x.com',
        }
    }
}
