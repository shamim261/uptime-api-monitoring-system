// Dependencies

const { check } = require('prettier');
const { parseJSON, randomStrGen } = require('../../helpers/utilities');
const { _token } = require('./tokenHandler');
const { maxchecks } = require('../../helpers/environments');

const data = require('../../lib/data');
// Module Scaffolding

const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethod = ['get', 'post', 'put', 'delete'];

    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};
handler._check = {};

// Registration
handler._check.post = (requestProperties, callback) => {
    const protocol = typeof requestProperties.body.protocol === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof requestProperties.body.successCodes === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // lookup the token
        const token = typeof requestProperties.headers.token === 'string' ? requestProperties.headers.token : false;
        // lookup phone by token
        data.read('tokens', token, (err1, tokenData) => {
            if (!err1 && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                // lookup the userData
                data.read('users', userPhone, (err2, userData) => {
                    if (!err2 && userData) {
                        _token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObj = parseJSON(userData);
                                const userChecks = typeof userObj.checks === 'object' && userObj.checks instanceof Array ? userObj.checks : [];
                                if (userChecks.length < 5) {
                                    const checkid = randomStrGen(20);
                                    const checkObj = {
                                        id: checkid,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    // save the checks

                                    data.create('checks', checkid, checkObj, (err3) => {
                                        if (!err3) {
                                            // add property to the user`s object
                                            userObj.checks = userChecks;
                                            userObj.checks.push(checkid);

                                            // update data
                                            data.update('users', userPhone, userObj, (err4) => {
                                                if (!err4) {
                                                    callback(200, checkObj);
                                                } else {
                                                    callback(500);
                                                }
                                            });
                                        } else {
                                            callback(500);
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'User reached max check limit',
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authendicaton problem',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'Authendicaton problem',
                        });
                    }
                });
            }
        });
    } else {
        callback(400);
    }
};

// View
handler._check.get = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObj.id === 'string' && requestProperties.queryStringObj.id.trim().length === 20 ? requestProperties.queryStringObj.id : false;

    if (id) {
        data.read('checks', id, (err5, checkData) => {
            if (!err5 && checkData) {
                const token = typeof requestProperties.headers.token === 'string' && requestProperties.headers.token.trim().length === 20 ? requestProperties.headers.token : false;

                _token.verify(token, parseJSON(checkData).userPhone, (isTokenValid) => {
                    if (isTokenValid) {
                        callback(200, parseJSON(checkData));
                    } else {
                        callback(401, {
                            error: 'Auth Problem!',
                        });
                    }
                });
            } else {
                callback(500);
            }
        });
    } else {
        callback(401);
    }
};

// Edit
handler._check.put = (requestProperties, callback) => {
    // inout validation
    const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;

    const protocol = typeof requestProperties.body.protocol === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof requestProperties.body.url === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof requestProperties.body.method === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof requestProperties.body.successCodes === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err1, checkData) => {
                if (!err1 && checkData) {
                    const checkObj = parseJSON(checkData);

                    const token = typeof requestProperties.headers.token === 'string' && requestProperties.headers.token.trim().length === 20 ? requestProperties.headers.token : false;

                    // check the token
                    _token.verify(token, checkObj.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObj.protocol = protocol;
                            }
                            if (method) {
                                checkObj.method = method;
                            }
                            if (url) {
                                checkObj.url = url;
                            }
                            if (successCodes) {
                                checkObj.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObj.timeoutSeconds = timeoutSeconds;
                            }

                            // store the data
                            data.update('checks', id, checkObj, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        success: 'Checks updated successfully',
                                    });
                                } else {
                                    callback(500);
                                }
                            });
                        } else {
                            callback(400);
                        }
                    });
                } else {
                    callback(400);
                }
            });
        } else {
            callback(400, {
                error: 'at least you need to edit one item!',
            });
        }
    } else {
        callback(400);
    }
};

// Delete
handler._check.delete = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObj.id === 'string' && requestProperties.queryStringObj.id.trim().length === 20 ? requestProperties.queryStringObj.id : false;

    if (id) {
        data.read('checks', id, (err5, checkData) => {
            if (!err5 && checkData) {
                const token = typeof requestProperties.headers.token === 'string' && requestProperties.headers.token.trim().length === 20 ? requestProperties.headers.token : false;
                const checkObj = parseJSON(checkData);

                _token.verify(token, checkObj.userPhone, (isTokenValid) => {
                    if (isTokenValid) {
                        // delete the data
                        data.delete('checks', id, (err) => {
                            if (!err) {
                                data.read('users', checkObj.userPhone, (err2, userData) => {
                                    if (!err2 && userData) {
                                        const userObj = parseJSON(userData);
                                        const userChecks = typeof userObj.checks === 'object' && userObj.checks instanceof Array ? userObj.checks : [];
                                        // remove the deleted id from users check list
                                        const checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            // restore the user data
                                            userObj.checks = userChecks;
                                            data.update('users', userObj.phone, userObj, (err3) => {
                                                if (!err3) {
                                                    callback(200, {
                                                        success: 'checks deleted successfully!',
                                                    });
                                                } else {
                                                    callback(500);
                                                }
                                            });
                                        } else {
                                            callback(500);
                                        }
                                    } else {
                                        callback(500);
                                    }
                                });
                            } else {
                                callback(500);
                            }
                        });
                    } else {
                        callback(401, {
                            error: 'Auth Problem!',
                        });
                    }
                });
            } else {
                callback(500);
            }
        });
    } else {
        callback(401);
    }
};

// exports
module.exports = handler;
