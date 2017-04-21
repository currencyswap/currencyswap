'use strict';

var exports = module.exports;
const appConfig = require('./app-config');
var redis = require('redis');
const errors = require('./errors/errors');

var errorUtil = require('./errors/error-util');
const util = require('util');
var ms = require('ms');

const SEC = 1000;
const DEF_EXPIRED = ms('7 d') / SEC;

const SECRET_KEYS = 'SECRET_KEYS:';
const SIGNATURES = 'SIGNATURES:';
const USERINFO = 'USERINFO:';

exports.setupClient = function () {

    let redisParam = appConfig.getRedis();

    var redisOptions = {
        host: redisParam.host,
        port: redisParam.port,
        db: redisParam.db,
        pass: redisParam.pass,
        ttl: redisParam.ttl,
        disableTTL: redisParam.disableTTL,
        prefix: redisParam.prefix
    };

    let redisClient = redis.createClient(redisOptions);

    redisClient.auth(redisParam.pass);

    redisClient.on('error', function (err) {
        console.error('REDIS ERROR : ' + err);
        // exports.redis = null;
    });

    redisOptions.client = redisClient;
    exports.redis = redisClient;
};

exports.set = function (key, value, exp) {
    if ( !exports.redis ) {
        return;
    }

    if (exp === undefined) {
        exports.redis.set(key, value);
    } else {
        exports.redis.setex(key, exp, value);
    }

};

exports.remove = function (key) {

    if ( !exports.redis ) {
        return;
    }

    exports.redis.del(key);

};

exports.get = function (key, callback) {

    if ( !exports.redis ) {
        return callback(errorUtil.createAppError(errors.REDIS_SERVER_GET_PROBLEM));
    }

    exports.redis.get(key, function (err, reply) {

        if (err) {
            console.error('ERROR [%s] : %s', err.name, err.message);
            return callback(errorUtil.createAppError(errors.REDIS_SERVER_GET_PROBLEM));
        }

        if (!reply) {
            let appError = errorUtil.createAppError(errors.MISSING_REDIS_KEY);
            appError.message = util.format(appError.message, key);

            console.error('ERROR : %s', appError.message);

            return callback(appError);
        }

        callback(null, reply);
    });
};

exports.getSecretKey = function (username, callback) {
    let key = SECRET_KEYS + username;
    exports.get(key, callback);
};

exports.setSecretKey = function (username, value) {
    let key = SECRET_KEYS + username;
    exports.set(key, value);
};

exports.setSecretKeyBySignature = function (sign, value) {

    let exp = appConfig.getTokenExpired();
    let milisec = ms(exp) / SEC + 1;
    let key = SIGNATURES + sign;

    exports.set(key, value, milisec);
};

exports.getSecretKeyBySignature = function (sign, callback) {

    let key = SIGNATURES + sign;
    exports.get(key, callback);
};

exports.setUserInfo = function (user) {
    let key = USERINFO + user.username;
    exports.set(key, JSON.stringify(user), DEF_EXPIRED);
};

exports.removeUserInfo = function (username) {
    let key = USERINFO + username;
    exports.remove(key);
};

exports.getUserInfo = function (username, callback) {
    let key = USERINFO + username;
    exports.get(key, function (err, reval) {
        let user = null;
        if (reval) {
            user = JSON.parse(reval);
        }

        callback(err, user);

    });
};

exports.checkResetCode = function (email, randomString, callback) {
    exports.get(email, function (err, value) {
        if (err) {
            return callback(errorUtil.createAppError(errors.RESET_PWD_CODE_NOT_FOUND));
        } else {
            if (!value) return callback(errorUtil.createAppError(errors.RESET_PWD_CODE_NOT_FOUND));
            else if (value !== randomString) return callback(errorUtil.createAppError(errors.RESET_PWD_CODE_DOES_NOT_MATCH));
            else return callback(null);
        }
    })
};

exports.checkActiveCode = function (username, randomString, callback) {
    exports.get(username, function (err, value) {
        if (err) {
            console.error('Can not get active code from redis with key ', username);
            return callback(errorUtil.createAppError(errors.ACTIVE_ACC_CODE_NOT_FOUND));
        } else {
            if (!value) return callback(errorUtil.createAppError(errors.ACTIVE_ACC_CODE_NOT_FOUND));
            else if (value !== randomString) return callback(errorUtil.createAppError(errors.ACTIVE_ACC_CODE_DOES_NOT_MATCH));
            else return callback(null);
        }
    })
};