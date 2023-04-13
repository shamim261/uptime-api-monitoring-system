// Dependencies

// Module Scaffolding

const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  callback(200, {
    message: "This is Sample URL",
  });
};

// exports
module.exports = handler;
