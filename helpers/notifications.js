// dependencies
const https = require('https');
const queryString = require('querystring');
const { log } = require('console');
const { twilio } = require('./environments');

// module scaffolding
const notifications = {};
// send sms to users

notifications.sendTwilioSMS = (phone, msg, callback) => {
    // validate inputs

    const userPhone = typeof phone === 'string' && phone.trim().length === 11 ? phone.trim() : false;
    const userMsg = typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if (userPhone && userMsg) {
        // configure a request payload
        const payload = {
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };
        // stringify the payload
        const stringifiedPayload = queryString.stringify(payload);

        // configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSID}/Messages.json`,
            auth: `${twilio.accountSID}:${twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the request
        const req = https.request(requestDetails, (res) => {
            // get the status code
            const status = res.statusCode;
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`status code returned was ${status}`);
            }
        });
        req.on('error', (e) => {
            callback(e);
        });
        req.write(stringifiedPayload);
        req.end();
    } else {
        callback('input/parameter missing!');
    }
};

// module exports
module.exports = notifications;
