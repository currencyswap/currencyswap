'use strict';

var errors = require('../libs/errors/errors');
var messages = require('../messages/messages');
var exchangeRateService = require('../services/exchange-rate-service');
var userValidation = require('../validation/user-validation');
var userConverter = require('../converters/user-converter');
var async = require('async');
var util = require('util');
var supportService = require('../services/support-service');
var constant = require('../libs/constants/constants');

module.exports = function (app) {
    var router = app.loopback.Router();

    router.get('/', function (req, res) {
        exchangeRateService.getLatestExchangeRate(function (err, latestExchangeRate) {
            if (err) {
                res.status(500).send(err)
            } else {
                var latestExchangeRateWithMedian = exchangeRateService.attachMedianRate(latestExchangeRate);
                res.status(200).send(latestExchangeRateWithMedian);
            }
        })
    });

    router.post('/', function (req, res) {
        var exRateObj = req.body;
        console.log("exRateObj  ",exRateObj);
        console.log(req.currentUser);
        var currentUser = req.currentUser;
        try {
            userValidation.validateExRateObj(exRateObj);
            userConverter.convertExRateValueToNumber(exRateObj);
            exRateObj = userConverter.changeCreatedDateToNow(exRateObj);
        } catch (err) {
            console.error('error: ', err);
            return res.status(500).send(err);
        }

        async.waterfall([
            function (next) {
                exchangeRateService.createExchange(exRateObj, function (err, exchangeRecord) {
                    if (err) {
                        return next(err);
                    } else {
                        return next (null, exchangeRecord);
                    }
                });
            },
            function createMessage(exchangeRecord, next) {
                try {
                    var stringifiedExchangeRecord = JSON.stringify(exchangeRecord);
                    console.log("stringifiedExchangeRecord", stringifiedExchangeRecord);
                } catch (err) {
                    return next (err);
                }
                supportService.messageToGroup({
                    'title': constant.MSG.NAIRA_EX_RATE_TITLE,
                    'message': stringifiedExchangeRecord,
                    'groupName': 'User',
                    'creatorId': currentUser.id
                });
                return next(null);
            },
        ], function (err) {
            if (err) {
                console.error(err);
                return res.status(500).send(err);
            } else {
                return res.status(200).send({});
            }
        });
    });

    return router;
};


