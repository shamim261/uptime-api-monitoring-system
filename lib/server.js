// Dependencies

const http = require('http');
const { handleReqRes } = require('../helpers/helperReqRes');
const env = require('../helpers/environments');
// server scaffoalding

const server = {};
// Create server

server.createServer = () => {
    const serverVariable = http.createServer(server.handleReq);
    serverVariable.listen(env.port, () => {
        console.log(`Server listening on ${env.port}`);
    });
};

// Handle Request and Response
server.handleReq = handleReqRes;

// start the server
server.init = () => {
    server.createServer();
};

// exports

module.exports = server;
