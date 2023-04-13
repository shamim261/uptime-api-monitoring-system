// dependencies

// module scaffoalding

const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    maxChecks: 5,
    twilio: {
        fromPhone: '+15074163570',
        accountSID: '{Your Twilio Account SID Here}',
        authToken: '{Your Twilio Account Auth Token Here}',
    },
};
environments.production = {
    port: 5000,
    envName: 'production',
};

// which environment was passed

const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'string';

// exported module

const environmentToExport = typeof environments[currentEnv] === 'object' ? environments[currentEnv] : environments.staging;

// export
module.exports = environmentToExport;
