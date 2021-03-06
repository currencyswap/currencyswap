'use strict';

var exports = module.exports;
var md5 = require('js-md5');
var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var app = require('../server');
var redis = require('../libs/redis');
var token = require('../libs/token');
var async = require('async');
var appConfig = require('../libs/app-config');

const SEC = 1000;

exports.createUser = function (user, callback) {

    if (user.username === undefined) {
        return callback(errorUtil.createAppError(errors.MEMBER_NO_USERNAME));
    }

    if (user.password === undefined) {
        return callback(errorUtil.createAppError(errors.MEMBER_NO_PASSWORD));
    }

    if (user.email === undefined) {
        return callback(errorUtil.createAppError(errors.MEMBER_NO_EMAIL));
    }

    user.password = md5(user.password);

    app.models.Member.create(user, function (err, instance) {

        let error = err ? errorUtil.createAppError(errors.SERVER_GET_PROBLEM) : null;

        callback(error, instance);

    });

}

exports.getUserById = function (userId, callback) {
    app.models.Member.findByUserId(userId, function (err, userObj) {
        if (err) return next(err);
        next(null, userObj);
    });
}

exports.getUserByUsername = function (username, callback) {

    app.models.Member.findByUsername(username, function (err, userObj) {
        if (err) return callback(err);
        callback(null, userObj);
    });
}

exports.getUserByUsernameWithPermissions = function (username, callback) {

    app.models.Member.findByUsernameWithPermissions(username, function (err, userObj) {
        if (err) return callback(err);
        callback(null, userObj);
    });

}

exports.login = function (user, callback) {

    async.waterfall([
        function (next) {
            app.models.Member.findByUsername(user.username, true, function (err, userObj) {

                if (err) return next(err);

                let password = md5(user.password);

                if (userObj.password != password) {
                    return next(errorUtil.createAppError(errors.MEMBER_INVALID_PASSWORD));
                }

                next(null, userObj);
            });
        },
        function (user, next) {
            // get User Secret Key
            redis.getSecretKey(user.username, function (err, value) {

                if (!err) return next(null, user, value);

                if (err.code != errors.MISSING_REDIS_KEY.code) {
                    return next(err);
                }

                // Generate Secret Key
                let secret = token.generateSecretKey(user.username);
                console.log('secret-key for %s: %s', user.username, secret);

                // Set to redis
                redis.setSecretKey(user.username, secret);

                return next(null, user, secret);

            });
        },
        function (user, secret, next) {
            let tokenKey = token.generate({ username: user.username }, secret);

            token.getSignature(tokenKey, function (err, sign) {
                console.log('sign-key for %s: %s', sign, tokenKey);
                next(err, user, secret, tokenKey, sign);
            });

        },
        function (user, secret, tokenKey, sign, next) {

            console.log("setSecretKeyBySignature %s", sign);
            redis.setSecretKeyBySignature(sign, JSON.stringify({ username: user.username, secret: secret }));
            next(null, tokenKey);
        }
    ], function (err, tokenKey) {
        callback(err, tokenKey);
    });

}
