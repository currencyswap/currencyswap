'use strict';

var exports = module.exports;
var stringUtil = require('../utilities/string-util');
var AppError = require('./app-error');

exports.getMessage = function (errorMessageLabel) {
    return stringUtil.getMessage(errorMessageLabel);
};

exports.createAppError = function (error) {
    error = error||{'message': 'Unknown', 'code': 0}; 
    let message = stringUtil.getMessage(error.message);
    return new AppError(message, error.code);
};

exports.getResponseError = function (error) {
    return {
        code: error.code ? error.code : 0,
        message: error.message
    };
};

