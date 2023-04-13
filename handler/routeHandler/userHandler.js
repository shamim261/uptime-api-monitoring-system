// Dependencies

const data = require('../../lib/data');
const { encrypt } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

// Module Scaffolding

const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethod = ['get', 'post', 'put', 'delete'];

    if (acceptedMethod.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};
handler._users = {};

// Registration
handler._users.post = (requestProperties, callback) => {
    const firstName =        typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;

    const lastName =
        typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;

    const phone =
        typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === 'string' && requestProperties.body.password.length > 0
            ? requestProperties.body.password
            : false;

    const tosAgreement =
        typeof requestProperties.body.tosAgreement === 'boolean' ? requestProperties.body.tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user doesn`t already exist
        data.read('users', phone, (err) => {
            if (err) {
                const userObj = {
                    firstName,
                    lastName,
                    phone,
                    password: encrypt(password),
                    tosAgreement,
                };
                // create user

                data.create('users', phone, userObj, (err1) => {
                    if (!err1) {
                        callback(200, {
                            message: 'user created successfully',
                        });
                    } else {
                        callback(500, {
                            message: 'coudnot create user!',
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'there was a probblem in server',
                });
            }
        });
    } else {
        callback(400, {
            error: 'there is problem in your request!',
        });
    }
};

// View
handler._users.get = (requestProperties, callback) => {
    const phone = typeof requestProperties.queryStringObj.phone === 'string';
    requestProperties.queryStringObj.phone.trim().length === 11 ? requestProperties.queryStringObj.phone : false;
    if (phone) {
        // verify token
        const token = typeof requestProperties.headers.token === 'string';
        requestProperties.headers.token.trim().length === 20 ? requestProperties.headers.token : false;
        tokenHandler._token.verify(token, phone, (tokenid) => {
            if (tokenid) {
                // lookup user
                data.read('users', phone, (err, u) => {
                    if (!err && u) {
                        const user = { ...parseJSON(u) };
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, {
                            'error ': 'Requested user not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    message: 'Auth Failed!',
                });
            }
        });
    } else {
        callback(404, {
            'error ': 'Requested user not found',
        });
    }
};

// Edit
handler._users.put = (requestProperties, callback) => {
    const phone = typeof requestProperties.body.phone === 'string';
    requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const firstName = typeof requestProperties.body.firstName === 'string';
    requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof requestProperties.body.lastName === 'string';
    requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const password = typeof requestProperties.body.password === 'string';
    requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone) {
        if (firstName || lastName || password) {
            // verify token
            const token = typeof requestProperties.headers.token === 'string';
            requestProperties.headers.token.trim().length === 20 ? requestProperties.headers.token : false;
            tokenHandler._token.verify(token, phone, (tokenid) => {
                if (tokenid) {
                    // read data
                    data.read('users', phone, (err, uD) => {
                        if (!err && uD) {
                            const userData = { ...parseJSON(uD) };

                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = encrypt(password);
                            }
                            // update data

                            data.update('users', phone, userData, (err2) => {
                                if (!err2) {
                                    callback(200, {
                                        message: 'User updated successfully!',
                                    });
                                } else {
                                    callback(500, {
                                        message: 'Internal server error!',
                                    });
                                }
                            });
                        } else {
                            callback(500, {
                                message: 'enter registered phone number',
                            });
                        }
                    });
                } else {
                    callback(403, {
                        message: 'Auth Failed!',
                    });
                }
            });
        }
    } else {
        callback(500, {
            message: 'enter a valid phone!',
        });
    }
};

// Delete
handler._users.delete = (requestProperties, callback) => {
    const phone = typeof requestProperties.queryStringObj.phone === 'string';
    requestProperties.queryStringObj.phone.trim().length === 11 ? requestProperties.queryStringObj.phone : false;
    if (phone) {
        // verify token
        const token = typeof requestProperties.headers.token === 'string';
        requestProperties.headers.token.trim().length === 20 ? requestProperties.headers.token : false;
        tokenHandler._token.verify(token, phone, (tokenid) => {
            if (tokenid) {
                // read data
                data.read('users', phone, (err) => {
                    if (!err) {
                        // delete data
                        data.delete('users', phone, (err3) => {
                            if (!err3) {
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
                callback(403, {
                    message: 'Auth Failed!',
                });
            }
        });
    } else {
        callback(400);
    }
};

// exports
module.exports = handler;
