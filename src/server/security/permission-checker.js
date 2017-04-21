'use strict';

const permissionMap = require('./permissions');
const permissionGroup = require('./permissions-groups');
var userService = require('../services/user-service');
var errors = require('../libs/errors/errors');
var async = require('async');
var routes = require('../routes');
var UrlPattern = require('url-pattern');
var errorUtil = require('../libs/errors/error-util');
var exports = module.exports;
var util = require('util');
var redis = require('../libs/redis');
var permissionConverter = require('../converters/permission-converter');
var constant = require('../libs/constants/constants');

var collectPermissionFromRules = function (request, permissionItem) {
    //console.log('permissionItem.rules', permissionItem.rules);
    for (let idx in permissionItem.rules) {
        let rule = permissionItem.rules[idx];

        if (rule.methods.indexOf(request.method) >= 0 && rule.isAlive) {
            return rule.requiredPermissions;
        }
    }

    return null;

};

var collectRequiredPermissions = function (request, callback) {

    let invalidPath = true;

    let reqPers = null;

    for (let key in permissionMap.permissions) {
        let per = permissionMap.permissions[key];
        let route = routes.getRoute(per.route);

        //console.log('route : %s', route);

        let pattern = new UrlPattern(route);

        if (pattern.match(request.path) != null) {

            let pers = collectPermissionFromRules(request, per);

            if (pers && pers.length > 0) {
                invalidPath = false;
                reqPers = pers;
            }

            break;
        }
    }

    if (invalidPath || !reqPers || reqPers.length <= 0) {
        let err = errorUtil.createAppError(errors.INVALID_REQUEST_PATH);
        err.message = util.format(err.message, request.path);
        return callback(err);
    }

    callback(null, reqPers);
};

var collectRequiredPermission = function (reqPers, callback) {
    let permissions = [];

    try {
        reqPers.forEach(function (perVal) {
            let per = permissionGroup.getPermission(perVal);
            if (!per) {
                let err = errorUtil.createAppError(errors.INVALID_PERMISSION);
                err.message = util.format(err.message, perVal);
                throw err;
            }

            permissions.push(per);

        });
    } catch (err) {
        return callback(err, permissions);
    }

    callback(null, permissions);

};

var validatePermission = function (permissions, requiredPermissions, callback) {

    for (let key in permissions) {

        if (requiredPermissions.indexOf(permissions[key]) >= 0) {
            return callback(null);
        }

    }
    let err = errorUtil.createAppError(errors.PERMISSION_DENIDED);

    callback(err);

};

var checkPermissionInRequest = function (request, permissions, callback) {
    console.log('PATH', request.method, request.path);
    //console.log('METHOD %s', request.method);

    async.waterfall([
        function (next) {
            collectRequiredPermissions(request, next);
        },
        function (reqPers, next) {
            collectRequiredPermission(reqPers, next);
        },
        function (requiredPermissions, next) {
            validatePermission(permissions, requiredPermissions, next);
        }
    ],
        function (err) {
            callback(err);
        });

};

exports.collectUserPermissionFormRedis = function (username, callback) {
    redis.getUserInfo(username, function (err, user) {
        if (err) {
            if (err.code && err.code == errors.MISSING_REDIS_KEY.code) {
                return callback(null, null);
            }

            return callback(err);
        }

        callback(null, user);
    });
};

exports.collectUserPermissionFormDB = function (username, callback) {
    userService.getUserByUsernameWithPermissions(username, callback);
};

exports.collectUserPermission = function (username, callback) {
    async.waterfall([
        function (next) {
            exports.collectUserPermissionFormRedis(username, next, function (err, user) {
                if (err) return next(err);
                else return next(null, user);

            });
        },
        function (user, next) {
            if (user) return next(null, user);

            exports.collectUserPermissionFormDB(username, function (err, user) {
                if (err) return next(err);

                console.log('collectUserPermissionFormDB Setup user');
                if (user) {
                    user = user.toJSON();
                    console.log('JSON %s', JSON.stringify(user));
                    if (user.expiredDate) {
                        var now = new Date();
                        var expire = (typeof user.expiredDate === 'string' ? new Date(user.expiredDate) : user.expiredDate);
                        now = now.getTime();
                        expire = expire.getTime();
                        if (expire < now) {
                            console.log('Your account get expired', username, 'Expired Time:', user.expiredDate);
                            var err = errorUtil.createAppError(errors.USER_ACCOUNT_EXPIRED);
                            return next(err);
                        }
                    }
                    if (user.status === constant.USER_STATUSES.EXPIRED) {
                        console.log('Your account get expired', username, 'Expired Time:', user.expiredDate);
                        var err = errorUtil.createAppError(errors.USER_ACCOUNT_EXPIRED);
                        return next(err);
                    }
                    // TODO Need to remove user session from redis when set user to be blocked
                    if (user.status === constant.USER_STATUSES.BLOCKED) {
                        console.log('Your account get blocked', username);
                        var err = errorUtil.createAppError(errors.USER_ACCOUNT_BLOCKED);
                        return next(err);
                    }
                    redis.setUserInfo(user);
                    return next(null, user);
                }
            });
        },
        function (user, next) {
            let permissions = permissionConverter.getPermissionsFormUser(user);

            //console.log( 'PERMISSION %s', JSON.stringify( permissions ) );

            next(null, user, permissions);
        }], function (err, user, permissions) {
            callback(err, user, permissions);
        });
};

exports.checkPermission = function (request, response, callback) {
    if (!request.currentUser || !request.currentUser.username) {
        let err = errorUtil.createAppError(errors.PERMISSION_DENIDED);
        return response.status(403).send(errorUtil.getResponseError(err));
    }

    async.waterfall([
        function (next) {
            exports.collectUserPermission(request.currentUser.username, next);
        },
        function (user, permissions, next) {
            if (user.status !== 'Activated') {
                let err = errorUtil.createAppError(errors.USER_IS_NOT_AVAILABLE);
                err.message = util.format(err.message, request.currentUser.username);
                return next(err);
            }

            checkPermissionInRequest(request, permissions, function (err) {
                next(err, user, permissions);
            });
        },
        function (user, permissions, next) {
            request.currentUser.permissions = permissions;
            request.currentUser.id = user.id;
            request.currentUser.isActivated = user.isActivated;

            next(null);

        }
    ],
        function (err) {
            if (!err) {
                return callback();
            }
            
            var errMsg = errorUtil.getResponseError(err);

            if (err.code == errors.SERVER_GET_PROBLEM.code || err.code == errors.INVALID_PERMISSION.code) {
                return response.status(500).send(errMsg);
            } else if (err.code == errors.INVALID_REQUEST_PATH.code) {
                return response.status(400).send(errMsg);
            } else if (err.code == errors.USER_IS_NOT_AVAILABLE.code) {
                return response.status(403).send(errMsg);
            } else if (err.code == errors.USER_ACCOUNT_EXPIRED.code) {
                return response.status(403).send(errMsg);
            } else if (err.code == errors.USER_ACCOUNT_BLOCKED.code) {
                return response.status(403).send(errMsg);
            } else {
                errMsg = errorUtil.getResponseError(errorUtil.createAppError(errors.PERMISSION_DENIDED));
                return response.status(403).send(errMsg);
            }
        });
};

