// Dependencies

const { sampleHandler } = require('./handler/routeHandler/sampleHandler');
const { userHandler } = require('./handler/routeHandler/userHandler');
const { tokenHandler } = require('./handler/routeHandler/tokenHandler');
const { checkHandler } = require('./handler/routeHandler/checkHandler');

const routes = {
    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

// exports

module.exports = routes;
