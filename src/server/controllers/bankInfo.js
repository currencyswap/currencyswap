'use strict';
var appConfig = require('../libs/app-config');
var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var httpHeaderUtil = require('../libs/utilities/http-header-util');
var userValidation = require('../validation/user-validation');
var service = require('../services/bankInfo-service');
var async = require('async');
var dateFormat = require('dateformat');

module.exports = function (app) {
    var router = app.loopback.Router();

    router.get('/:accountNumber', function (req, res) {
        var accountNumber = req.params.accountNumber;
        service.checkExistedBankAccount(accountNumber)
            .then(function (resp) {
                if (resp === null) {
                    return res.status(200).send({});
                } else {
                    return res.status(400).send(errorUtil.createAppError(errors.BANK_ACC_NUM_EXISTED));
                }
            }, function (err) {
                console.error(err);
                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            })
    });

    return router;
};

