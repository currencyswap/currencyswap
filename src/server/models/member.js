'use strict';

var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var util = require('util');
var constants = require('../libs/constants/constants');

module.exports = function (Member) {
    Member.observe('after save', function (ctx, next) {

        if (!ctx.instance) {
            return next();
        }

        // redis.removeUserFromRedis( ctx.instance.username );

        next();
    });

    Member.findByUserId = function (userId, callback) {
        /*console.log('userId: ', userId);
        if (typeof userId !== 'number') {
            userId = parseInt(userId);
        }
        if (typeof isActivated == 'function') {
            callback = isActivated;
            isActivated = null;
        }*/

        var where = {
            id: userId
        };

        /*if (isActivated !== undefined && isActivated !== null) {
            where.isActivated = isActivated;
        }*/

        var includeGroups = {
            relation: 'groups'
        };

        var includeAddresses = {
            relation: 'addresses'
        };

        var includeInvitees = {
            relation: 'invitees'
        };

        var includeInviters = {
            relation: 'inviters'
        };

        var includeBankInfo = {
            relation: 'bankInfo'
        };

        var filter = {
            where: where,
            include: [includeGroups, includeAddresses, includeInvitees, includeInviters, includeBankInfo]
        };

        Member.findOne(filter, function (err, user) {

            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user) {
                var appError = errorUtil.createAppError(errors.MEMBER_INVALID_USERID);
                appError.message = util.format(appError.message, userId);
                return callback(appError);
            }

            callback(null, user);
        });
    };

    Member.findByUsername = function (username, isActivated, callback) {

        if (typeof isActivated == 'function') {
            callback = isActivated;
            isActivated = null;
        }

        var where = {
            username: username
        };

        if (isActivated !== undefined && isActivated !== null) {
            where.isActivated = isActivated;
        }

        var includeGroups = {
            relation: 'groups'
        };

        var includeAddresses = {
            relation: 'addresses'
        };

        var includeBankInfo = {
            relation: 'bankInfo'
        };

        var filter = {
            where: where,
            include: [includeGroups, includeAddresses, includeBankInfo]
        };

        Member.findOne(filter, function (err, user) {

            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user) {
                var appError = errorUtil.createAppError(errors.MEMBER_INVALID_USERNAME);
                appError.message = util.format(appError.message, username);
                return callback(appError);
            }

            callback(null, user);
        });
    };

    Member.findByUsernameWithPermissions = function (username, callback) {
        var where = {
            username: username,
            isActivated: true
        };

        var includeGroups = {
            relation: 'groups',
            scope: {
                include: 'permissions'
            }
        };

        var filter = {
            where: where,
            include: includeGroups
        };

        Member.findOne(filter, function (err, user) {

            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user) {
                var appError = errorUtil.createAppError(errors.MEMBER_INVALID_USERNAME);
                appError.message = util.format(appError.message, username);
                return callback(appError);
            }

            callback(null, user);
        });
    };

    Member.findByEmail = function (email, callback) {
        var where = {
            email: email
        };

        var filter = {
            where: where
        };

        Member.findOne(filter, function (err, user) {

            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user) {
                return callback(errorUtil.createAppError(errors.MEMBER_EMAIL_NOT_FOUND));
            }

            callback(null, user);
        });
    };

    Member.findAll = function (callback) {
        Member.find(function (err, users) {
            if (err) return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            else {
                if (!users || users.length < 0) return callback(errorUtil.createAppError(errors.NO_USER_FOUND_IN_DB));
                else return callback(null, users);
            }
        });
    };

    Member.findUsersFollowStatus = function (status, callback) {
        var where = {
            status: status
        };
        var includeAddress = {
            relation: 'addresses'
        };

        var filter = {
            where: where,
            include: includeAddress
        };
        Member.findOne(filter, function (err, user) {
            if (err) return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            else {
                if (!user) return callback(errorUtil.createAppError(errors.NO_USER_FOUND_IN_DB));
                return callback(null, user);
            }
        })
    };

    Member.findUserDetailWithEmail = function (userId, callback) {
        var where = {
            id: userId
        };

        var includeAddress = {
            relation: 'addresses'
        };

        var filter = {
            where: where,
            include: includeAddress
        };

        Member.findOne(filter, function (err, user) {
            if (err) {
                console.error('findOne error: ', err);
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user)  {

                var appError = errorUtil.createAppError( errors.MEMBER_INVALID_USERID );

                appError.message = util.format(appError.message, userId);

                return callback( appError );
            }

            return callback(null, user);
        })
    };

    Member.findUserByUserName = function (username, callback) {
        var where = {
            username: username
        };

        var filter = {
            where: where
        };

        Member.findOne(filter, function (err, user) {
            if (err) return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            else {
                if (!user) return callback(errorUtil.createAppError(errors.NO_USER_FOUND_IN_DB));
                return callback(null, user);
            }
        })
    };

    Member.findUserByNationalId = function (nationalId, callback) {
        var where = {
            nationalId: nationalId
        };

        var filter = {
            where: where
        };

        Member.findOne(filter, function (err, user) {
            if (err) {
                console.log('error on finding user by nationalid: ', err);
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }
            else {
                if (!user) {
                    console.log('no user found with this nationalid');
                    return callback(errorUtil.createAppError(errors.NO_USER_FOUND_IN_DB));
                }
                return callback(null, user);
            }
        })
    };

    Member.findUserByCellphone = function (cellphone, callback) {
        var where = {
            cellphone: cellphone
        };

        var filter = {
            where: where
        };

        Member.findOne(filter, function (err, user) {
            if (err) return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            else {
                if (!user) return callback(errorUtil.createAppError(errors.NO_USER_FOUND_IN_DB));
                return callback(null, user);
            }
        })
    };
};
