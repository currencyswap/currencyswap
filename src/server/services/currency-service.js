'use strict';

var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var app = require('../server');

var dbUtil = require('../libs/utilities/db-util');

exports.create = function (currencies, callback) {
    app.models.Currency.get(currencies, function (err, objs) {
        if (err) console.error('ERROR [%s]: %s', err.name, err.message);
        let error = err ? errorUtil.createAppError(errors.SERVER_GET_PROBLEM) : null;
        
        callback(error, objs);

    });
};

exports.filterCurrency = function (filter) {
	return dbUtil.executeModelFn(app.models.Currency, 'find', filter);
};
