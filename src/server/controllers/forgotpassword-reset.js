'use strict';
var mailSender = require('../libs/mail-sender');
var userService = require('../services/user-service');
var errorUtil = require('../libs/errors/error-util');
var crypto = require('crypto');
var async = require('async');
var constant = require('../libs/constants/constants');
var md5 = require('md5');

//temporary
var errors = require('../libs/errors/errors');
var appConfig = require('../libs/app-config');
var util = require('util');

module.exports = function (app) {
    var router = app.loopback.Router();

    router.get('/', function (req, res) {
        var resetCode = req.query.resetCode;
        userService.checkResetPwdCode(resetCode, function (err) {
            if (err) return res.status(constant.HTTP_FAILURE_CODE).send(err);
            else return res.status(constant.HTTP_SUCCESS_CODE).send({});
        });
    });

    router.post('/', function (req, res) {
        var newPassword = req.body.newPassword;
        var resetCode = req.body.resetCode;

        userService.resetPassword(newPassword, resetCode, function (err) {
            if (err) res.status(constant.HTTP_FAILURE_CODE).send(err);
            else res.status(constant.HTTP_SUCCESS_CODE).send({});
        });
    });

    return router;
};
