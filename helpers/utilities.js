// dependencies

const crypto = require('crypto');

// module scaffholding

const utilities = {};

// parse JSON string to Object

utilities.parseJSON = (parseStr) => {
    let output;
    try {
        output = JSON.parse(parseStr);
    } catch {
        output = 'error parse at JSON PARSE';
    }
    return output;
};

// encrypting password

utilities.encrypt = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', 'password').update(str).digest('hex');
        return hash;
    }
    return false;
};

// Random String Generator

utilities.randomStrGen = (len) => {
    let strLen = len;
    strLen = typeof strLen === 'number' && strLen > 0 ? strLen : false;
    if (strLen) {
        const possibleChar = 'abcdefghijklmnopqrstuvwxyz123456789';
        let output = '';

        for (i = 1; i <= strLen; i += 1) {
            const randomChar = possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
            output += randomChar;
        }
        return output;
    }
    return false;
};

// export

module.exports = utilities;
