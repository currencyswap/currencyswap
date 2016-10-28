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

    Member.findByUserId = function (userId, isActivated, callback) {

        if (typeof isActivated == 'function') {
            callback = isActivated;
            isActivated = null;
        }

        let where = {
            id: userId
        };

        if (isActivated !== undefined && isActivated !== null) {
            where.isActivated = isActivated;
        }

        let includeGroups = {
            relation: 'groups'
        };

        let includeAddresses = {
            relation: 'addresses'
        };

        let filter = {
            where: where,
            include: [includeGroups, includeAddresses]
        };

        Member.findOne(filter, function (err, user) {

            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user) {
                let appError = errorUtil.createAppError(errors.MEMBER_INVALID_USERID);
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

        let where = {
            username: username
        };

        if (isActivated !== undefined && isActivated !== null) {
            where.isActivated = isActivated;
        }

        let includeGroups = {
            relation: 'groups'
        };

        let includeAddresses = {
            relation: 'addresses'
        };

        let filter = {
            where: where,
            include: [includeGroups, includeAddresses]
        };

        Member.findOne(filter, function (err, user) {

            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user) {
                let appError = errorUtil.createAppError(errors.MEMBER_INVALID_USERNAME);
                appError.message = util.format(appError.message, username);
                return callback(appError);
            }

            callback(null, user);
        });
    };

    Member.findByUsernameWithPermissions = function (username, callback) {
        let where = {
            username: username,
            isActivated: true
        };

        let includeGroups = {
            relation: 'groups',
            scope: {
                include: 'permissions'
            }
        };

        let filter = {
            where: where,
            include: includeGroups
        };

        Member.findOne(filter, function (err, user) {

            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user) {
                let appError = errorUtil.createAppError(errors.MEMBER_INVALID_USERNAME);
                appError.message = util.format(appError.message, username);
                return callback(appError);
            }

            callback(null, user);
        });
    };

    Member.findByEmail = function (email, callback) {
        let where = {
            email: email
        };

        let filter = {
            where: where
        };
        Member.findOne(filter, function (err, user) {

            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            }

            if (!user) {
                let appError = errorUtil.createAppError(errors.MEMBER_EMAIL_NOT_FOUND);
                appError.message = util.format(appError.message, email);
                return callback(appError);
            }

            callback(null, user);
        });
    };

    Member.updatePassword = function (newPassword, callback) {
        var updatedField = constants.PASSWORD_FIELD;
        Member.updateUserInfo(updatedField, newPassword, function (err, updatedUser) {
            if (err) {
                return callback(err);
            }
            return callback(null, updatedUser);
        })
    };

    Member.updateUserInfo = function (attrName, newAttrValue, callback) {
        Member.updateAttribute(attrName, newAttrValue, function (err, updatedUser) {
            if (err) {
                return callback(err);
            }
            return callback(null, updatedUser);
        })
    };
};
