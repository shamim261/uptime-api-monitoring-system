// dependecies
const url = require('url');
const http = require('http');
const https = require('https');
const data = require('./data');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSMS } = require('../helpers/notifications');

// scaffolding

const worker = {};

// get the checks
worker.gatherAllChecks = () => {
    data.getList('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach((check) => {
                data.read('checks', check, (err1, orgData) => {
                    if (!err1 && orgData) {
                        // validate the data
                        worker.validateOrgData(parseJSON(orgData));
                    } else {
                        console.log('error reading data');
                    }
                });
            });
        } else {
            console.log('error getting list');
        }
    });
};

// validate orgData
worker.validateOrgData = (orgCheckData) => {
    const orgData = orgCheckData;
    if (orgData && orgData.id) {
        orgData.state = typeof orgData.state === 'string' && ['up', 'down'].indexOf(orgData.state) > -1 ? orgData.state : 'down';
        orgData.lastChecked = typeof orgData.lastChecked === 'number' && orgData.lastChecked > 0 ? orgData.lastChecked : false;
        // pass to the next process
        worker.performCheck(orgData);
    } else {
        console.log('error: invalid data/ blank data');
    }
};

// perform Check
worker.performCheck = (orgData) => {
    // prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false,
    };
    // mark the outcome not been sent yet

    let outcomeSent = false;

    // parse the hostname and full url
    const parsedUrl = url.parse(`${orgData.protocol}://${orgData.url}`, true);
    const hostName = parsedUrl.hostname;
    const { path } = parsedUrl;

    // construct the request

    const requestDetails = {
        protocol: `${orgData.protocol}:`,
        hostname: hostName,
        method: orgData.method.toUpperCase(),
        path,
        timeout: orgData.timeoutSeconds * 1000,
    };
    const protocolToUse = orgData.protocol === 'http' ? http : https;

    // send the request

    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status code
        const status = res.statusCode;

        // update the check outcome and pass the next proccess
        checkOutCome.responseCode = status;

        if (!outcomeSent) {
            worker.proccessCheckOutcome(orgData, checkOutCome);
            outcomeSent = true;
        }
    });

    //  Error
    req.on('error', (e) => {
        checkOutCome = {
            error: true,
            value: e,
        };
        if (!outcomeSent) {
            worker.proccessCheckOutcome(orgData, checkOutCome);
            outcomeSent = true;
        }
    });

    // TimeOut
    req.on('timeout', () => {
        checkOutCome = {
            error: true,
            value: 'timeout',
        };
        if (!outcomeSent) {
            worker.proccessCheckOutcome(orgData, checkOutCome);
            outcomeSent = true;
        }
    });

    // Request start
    req.end();
};

// Proccess Check Outcome
worker.proccessCheckOutcome = (orgData, checkOutCome) => {
    // check if check outcomer is up or down
    const state = !checkOutCome.error && checkOutCome.responseCode && orgData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    // decide wheather we should alert user or not
    const warnUser = !!(orgData.lastChecked && orgData.state !== state);

    // update the check data
    const newCheckData = orgData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    // update the check to the file

    data.update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (warnUser) {
                // send the checkdata to next roccess
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('State not changed');
            }
        } else {
            console.log('error: updaing user check state!');
        }
    });
};

// send notification to user

worker.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}.`;

    sendTwilioSMS(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`user is alerted by sms: ${msg}`);
        } else {
            console.log('error sending sms!');
        }
    });
};
// loop
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 10000);
};
// start the workers

worker.init = () => {
    // execute all the checks
    worker.gatherAllChecks();

    // loop all checks
    worker.loop();
};
// export

module.exports = worker;
