// Dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notfoundhandler } = require('../handler/routeHandler/notfoundhandler');
const { parseJSON } = require('./utilities');

// module scaffoalding

const handler = {};

handler.handleReqRes = (req, res) => {
    // Request

    const parsedurl = url.parse(req.url, true);
    const Path = parsedurl.pathname;
    const trimmedPath = Path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObj = parsedurl.query;
    const { headers } = req;

    const requestProperties = {
        parsedurl,
        Path,
        trimmedPath,
        method,
        queryStringObj,
        headers,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const choosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notfoundhandler;

    req.on('data', (chunck) => {
        realData += decoder.write(chunck);
    });
    req.on('end', () => {
        // Response
        realData += decoder.end();

        requestProperties.body = parseJSON(realData);

        choosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payload = typeof payload === 'object' ? payload : {};

            const payloadStr = JSON.stringify(payload);

            // Final Response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadStr);
        });
    });
};

// exports
module.exports = handler;
