'use strict';

var AppError = require('../libs/errors/app-error');
var errors = require('../libs/errors/errors');
var stringUtil = require('../libs/utilities/string-util');
var messages = require('../messages/messages');
var constant = require('../libs/constants/constants');
var service = require('../services/currency-service');
var appConfig = require('../libs/app-config');
var util = require('util');

module.exports = function (app) {
    var router = app.loopback.Router();
    
    router.get('/', function (req, res) {

    	var filter = {
    			'order': 'position ASC'
    	};
        service.filterCurrency(filter).then(function(resp){
        	return res.send(resp);
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    
    return router;
};

