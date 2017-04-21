var app = require('../server');
var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var async = require('async');

exports.createExchange = function (exchangeObj, callback) {
    app.models.Exchanges.create(exchangeObj, function (err, exchangeRecord) {
        if (err) {
            console.error(err);
            return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        } else {
            return callback(null, exchangeRecord);
        }
    });
};

exports.createMultiExchange = function (exchangeObjs, callback) {
    var exchanges = [];
    async.eachSeries(exchangeObjs, function (exchangeObj, next) {

        exports.createExchange(exchangeObj, function (err, instance) {
            if (err || !instance) return next(err, instance);
            exchanges.push(instance);
            next(null, instance);
        });

    }, function (err) {
        callback(err, exchanges);
    });
};

exports.getLatestExchangeRate = function (callback) {
    app.models.Exchanges.findOne({
        order: 'createdDate DESC'
    }, function (err, latestExchangeRate) {
        if (err) {
            return callback (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        } else {
            return callback(null, latestExchangeRate);
        }
    });
};

exports.attachMedianRate = function (latestExchangeRate) {
    var usDollarMedian = Math.round((latestExchangeRate.usDollarSell + latestExchangeRate.usDollarBuy) / 2);
    var poundMedian = Math.round((latestExchangeRate.poundSell + latestExchangeRate.poundBuy) / 2);
    var euroMedian = Math.round((latestExchangeRate.euroSell + latestExchangeRate.euroBuy) / 2);

    latestExchangeRate.usDollarMedian = usDollarMedian;
    latestExchangeRate.poundMedian = poundMedian;
    latestExchangeRate.euroMedian = euroMedian;

    return latestExchangeRate;
};