// Dependencies

const data = require('../../lib/data');
const { encrypt } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const { randomStrGen } = require('../../helpers/utilities');

// Module Scaffolding

const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethod = ['get', 'post', 'put', 'delete'];

    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._token = {};

// Registration
handler._token.post = (requestProperties, callback) => {
    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone && password) {
        // read data
        data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                const hashedPass = encrypt(password);
                if (hashedPass === parseJSON(userData).password) {
                    const tokenid = randomStrGen(20);
                    const expires = Date.now() + 60 * 60 * 1000;
                    const tokenObj = {
                        phone,
                        id: tokenid,
                        expires,
                    };

                    // store token
                    data.create('tokens', tokenid, tokenObj, (err) => {
                        if (!err) {
                            callback(200, {
                                message: 'created token successfully',
                            });
                        } else {
                            callback(500, {
                                message: 'there is a problem in server',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        message: ' password is not valid',
                    });
                }
            } else {
                callback(400, {
                    message: ' there is a problem in your request 1',
                });
            }
        });
    } else {
        callback(400, {
            message: ' there is a problem in your request 2',
        });
    }
};

// View
handler._token.get = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObj.id === 'string' && requestProperties.queryStringObj.id.trim().length === 20 ? requestProperties.queryStringObj.id : false;
    if (id) {
        // lookup user
        data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                const user = { ...parseJSON(tokenData) };
                callback(200, user);
            } else {
                callback(404, {
                    'error ': 'Requested token not found',
                });
            }
        });
    } else {
        callback(404, {
            'error ': 'Requested token not found',
        });
    }
};

// Edit
handler._token.put = (requestProperties, callback) => {
    const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.length === 20 ? requestProperties.body.id : false;
    const extend = !!(typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true);

    if (id && extend) {
        // read data
        data.read('tokens', id, (err, tData) => {
            if (!err && tData) {
                const tokenData = parseJSON(tData);
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 60 * 60 * 1000;
                    // update data
                    data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200, {
                                success: 'token updated successfully',
                            });
                        } else {
                            callback(500, {
                                message: ' Internal server error!',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        message: 'Token already expired!',
                    });
                }
            } else {
                callback(400, {
                    message: 'There is problem in your request! 1',
                });
            }
        });
    } else {
        callback(400, {
            message: 'There is problem in your request! 2',
        });
    }
};

// Delete
handler._token.delete = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObj.id === 'string' && requestProperties.queryStringObj.id.trim().length === 20 ? requestProperties.queryStringObj.id : false;
    if (id) {
        // read data
        data.read('tokens', id, (err) => {
            if (!err) {
                // delete data
                data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Successfully Deleted!',
                        });
                    } else {
                        callback(500, {
                            message: 'Internal server error!',
                        });
                    }
                });
            } else {
                callback(400);
            }
        });
    } else {
        callback(400);
    }
};

// Token Verify
handler._token.verify = (id, phone, callback) => {
    // read data
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};
// exports
module.exports = handler;
