// Dependencies

// Module Scaffolding

const handler = {};

handler.notfoundhandler = (requestProperties, callback) => {
  callback(404, {
    message: "Your requested URL was not found!",
  });
};

// exports
module.exports = handler;
