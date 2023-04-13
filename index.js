// Dependencies

const server = require('./lib/server');
const worker = require('./lib/worker');

// App scaffoalding
const app = {};

app.init = () => {
    // start the server
    server.init();

    // start the worker
    worker.init();
};

app.init();

// export
module.exports = app;
