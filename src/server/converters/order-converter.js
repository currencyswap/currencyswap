'use strict';

var exports = module.exports;
var constant = require('../libs/constants/constants');

exports.convertOrderData = function (requestOrder) {
    var resultOrder = {};
    
    resultOrder.code = "";
    resultOrder.created = new Date();
    resultOrder.updated = new Date();
    
    if(requestOrder.rate) resultOrder.rate = parseFloat(requestOrder.rate);
    if(requestOrder.give) resultOrder.give = parseInt(requestOrder.give);
    if(requestOrder.giveCurrencyId) resultOrder.giveCurrencyId = parseInt(requestOrder.giveCurrencyId);
    if(requestOrder.get) resultOrder.get = parseInt(requestOrder.get);
    if(requestOrder.getCurrencyId) resultOrder.getCurrencyId = parseInt(requestOrder.getCurrencyId);
    
    resultOrder.ownerId = 0;
    resultOrder.accepterId = 0;
    
    resultOrder.statusId = 0;
    
    var dayLive = requestOrder.dayLive ? parseInt(requestOrder.dayLive) : 3;
    resultOrder.expired = new Date();
    resultOrder.expired.setDate(resultOrder.expired.getDate() + dayLive);
    
    return resultOrder;
};
