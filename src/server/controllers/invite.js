'use strict';

var AppError = require('../libs/errors/app-error');
var stringUtil = require('../libs/utilities/string-util');
var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var messages = require('../messages/messages');
var constant = require('../libs/constants/constants');
var userService = require('../services/user-service');
var userValidation = require('../validation/user-validation');
var async = require('async');
var util = require('util');

module.exports = function (app) {
    var router = app.loopback.Router();

    router.post('/', function (req, res) {
        var inviter = req.body.inviter;
        var inviteeEmail = req.body.regEmail;

        //step 1: validate email and validate inviter
        try {
            userValidation.validateInviteRequest(inviter, inviteeEmail);
        } catch (err) {
            return res.status(400).send(err);
        }

        async.waterfall([
            function (next) {
                //step 2: check if email is existed in DB, if not continue
                userService.checkUserExistWithEmail(inviteeEmail, function (err, existed) {
                    if (existed) {
                        return next(errorUtil.createAppError(errors.EMAIL_EXISTED));
                    } else {
                        return next (null);
                    }
                });
            },
            function (next) {
                //step 4: generate registration link
                var protocolHostAndPort = req.protocol + '://' + req.get('host');
                var invitationLink = userService.generateInvitationLink(inviter, inviteeEmail, protocolHostAndPort);
                return next (null, invitationLink)
            },
            function (invitationLink, next) {
                //step 5: send link to email
                userService.sendInvitationMail(invitationLink, inviter, inviteeEmail, function (err) {
                    if (err) {
                        return next(err);
                    } else {
                        return res.status(constant.HTTP_SUCCESS_CODE).send({});
                    }
                })
            }
        ], function (err) {
            if (err) {
                if (err.code === errorUtil.createAppError(errors.SERVER_GET_PROBLEM).code) {
                    return res.status(500).send(err);
                } else {
                    return res.status(400).send(err);
                }
            }
        });
    });

    router.get('/', function (req, res) {
        var inviteeEmail = req.query.email;

        userService.checkUserExistWithEmail(inviteeEmail, function (err, existed) {
            if (existed) {
                res.status(constant.HTTP_FAILURE_CODE).send(errorUtil.createAppError(errors.EMAIL_EXISTED));
            } else {
                res.status(constant.HTTP_SUCCESS_CODE).send({});
            }
        });
    });

    return router;
};


