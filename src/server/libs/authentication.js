'use strict';
var util = require('util');
var token = require('./token');
var async = require('async');

var errors = require('./errors/errors');
var errorUtil = require('./errors/error-util');
var constant = require('../libs/constants/constants');
var ExpError = require('../libs/errors/error-common');
var httpHeaderUtil = require('./utilities/http-header-util');
var redis = require('./redis');

var exports = module.exports;

exports.authenticateByToken = function (request, response, callback) {
    async.waterfall([
        function (next) {
            httpHeaderUtil.getAuthBearerHeader(request, next);
        },
        function (headerStr, next) {
            token.getSignature(headerStr, function (err, sign) {
                //console.log('Signnature : %s', sign);
                next(err, headerStr, sign);
            });
        },
        function (headerStr, sign, next) {
            redis.getSecretKeyBySignature(sign, function (err, value) {

                if (err) {
                    if (err.code == errors.MISSING_REDIS_KEY.code) {
                        err = errorUtil.createAppError(errors.INVALID_TOKEN_API_KEY);
                    }

                    return next(err);
                }

                let obj = JSON.parse(value);

                //console.log('secret : %s', obj.secret);
                //console.log('username : %s', obj.username);

                next(err, headerStr, obj.secret, obj.username);
            });
        },
        function (headerStr, secret, username, next) {
            token.verify(headerStr, secret, function (err, decode) {
                next(err, decode, username);
            });
        },
        function (decode, username, next) {
            //console.log('secret : %s', JSON.stringify(decode));
            if (decode.username !== username) {
                let err = errorUtil.createAppError(errors.INVALID_TOKEN_API_KEY);
                err.message = util.format(err.message, decode.username);
                return next(err);
            }

            next(null, username);
        },
        function (username, next) {
            request.currentUser = {
                username: username
            };
            redis.getUserInfo(username, function (err, user) {
                if (user && user.username) {
                    request.currentUser = user;
                    if (user.expiredDate) {
                        var now = new Date();
                        var expire = (typeof user.expiredDate === 'string' ? new Date(user.expiredDate) : user.expiredDate);
                        now = now.getTime();
                        expire = expire.getTime();
                        if (expire < now) {
                            console.log('User get expired', username, 'Expired Time:', user.expiredDate);
                            redis.removeUserInfo(username);
                            var err = errorUtil.createAppError(errors.USER_ACCOUNT_EXPIRED);
                            return next(err);
                        }
                    }
                }
                return next(null);
            });
        }
    ], function (err) {
        if (!err) return callback();
        console.error('ERROR [%s]: %s', err.name, err.message);
        if (ExpError.isReqService(request)) {
            return response.status(constant.HTTP_FAILURE_CODE).send(err);
        }
        return ExpError.errorHandler404(request, response);
    });
};
