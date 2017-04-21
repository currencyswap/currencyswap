'use strict';

var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var app = require('../server');

var dbUtil = require('../libs/utilities/db-util');

exports.filterStatusType = function (filter) {
	return dbUtil.executeModelFn(app.models.StatusType, 'find', filter);
};
