'use strict';

const config = require('../global-config');
const error = require('./errors/errors');

var AppError = require('./errors/app-error');
var errorUtil = require('./errors/error-util');

var exports = {};

exports.DATE_FORMAT = 'yyyy-mm-dd';
exports.DATETIME_FORMAT = 'yyyy-mm-dd HH:MM:ss';
exports.DATETIME_MS_FORMAT = 'yyyy-mm-ss HH:MM:ss L';
exports.TIME_FORMAT = 'HH:MM:ss';

const SLASH_CHAR = '/';

var DEFAULT_REDIS_CONF = {
        host: 'localhost',
        port: 6379,
        db: 0,
        pass: '',
        ttl: 3600,
        disableTTL: false,
        prefix: 'appsess:'
    };

exports.getDateFormat = function () {
    let dateFormat = config.dateFormat;

    if (dateFormat) return dateFormat;

    return {
        datetime: exports.DATETIME_FORMAT,
        date: exports.DATE_FORMAT,
        time: exports.TIME_FORMAT
    };
}
    ;
exports.getTitle = function () {
    return config.title || '';
};

exports.getFooter = function () {
    return config.footer || '';
};

exports.getSuperUsername = function () {
    return config.superUsername || 'admin';
};

exports.getRedis = function () {
    if (config.redis === undefined) {
        let message = errorUtil.getMessage(error.INVALID_REDIS_PARAMS.message);
        throw new AppError(message, error.INVALID_REDIS_PARAMS.code);
    }

    var conf = Object.assign({}, DEFAULT_REDIS_CONF, config.redis);
    if (config.debug) {
        console.log('REDIS configuration info:', JSON.stringify(conf));
    }
    return conf;
};

exports.getTokenExpired = function () {
    return config.tokenExpired;
};

exports.getLogsFolder = function () {
    return config.logs;
};


exports.getMediaFolder = function () {

    if ( config.mediaFolder.slice(-1) != SLASH_CHAR) {
        return config.mediaFolder + SLASH_CHAR;
    } 
    return config.mediaFolder;
};

exports.getPaymentEvidenceFolder = function () {
    if (config.paymentEvidence.slice(-1) != SLASH_CHAR) {
        return config.paymentEvidence + SLASH_CHAR;
    }
    return config.paymentEvidence;
};


exports.getSMTPOptions = function () {

    if (!config.smtp || !(config.smtp.host || config.smtp.service)) {
        return null;
    }

    var options = {};

    if ( config.smtp.host ) options.host = config.smtp.host;
    if ( config.smtp.service ) options.service = config.smtp.service;

    if (config.smtp.port) options.port = config.smtp.port;

    if (config.smtp.auth) options.auth = config.smtp.auth;
    else if (config.smtp.username && config.smtp.password) {
        options.auth = {
            user: config.smtp.username,
            pass: config.smtp.password
        };
    }

    options.secure = config.smtp.ssl ? true : false;

    if (config.smtp.connectionTimeout) options.connectionTimeout = config.smtp.connectionTimeout;
    if (config.smtp.greetingTimeout) options.greetingTimeout = config.smtp.greetingTimeout;
    if (config.smtp.socketTimeout) options.socketTimeout = config.smtp.socketTimeout;
    if (config.smtp.authMethod) options.authMethod = config.smtp.authMethod;
    if (config.smtp.tls) options.tls = config.smtp.tls;
    if (config.smtp.ignoreTLS) options.ignoreTLS = config.smtp.ignoreTLS;
    
    return options;
};

exports.getMailSenderInfo = function () {
    return config.mailSender;
};

exports.getResetPwdCodeExipired = function () {
    return config.resetPwdCodeExpired;
};

exports.getAppHost = function () {
    return config.host;
};

module.exports = exports;