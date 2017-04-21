var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var app = require('../server');
var Q = require('q');
var dbUtil = require('../libs/utilities/db-util');
var constant = require('../libs/constants/constants');

exports.createNewBankInfo = function (accepterBankInfo) {
    return dbUtil.executeModelFn(app.models.BankInfo, 'create', accepterBankInfo)
};

exports.saveOrderBankInfo = function (updatingOrderBankInfo) {
    return dbUtil.executeModelFn(app.models.OrderBankInfo, 'create', updatingOrderBankInfo);
};

exports.checkExistedBankAccount = function (bankAccountNumber) {
    var filter = {
        'where' : {'bankAccountNumber': bankAccountNumber}
    };
    return dbUtil.executeModelFn(app.models.BankInfo, 'findOne', filter);
};

exports.updateOrderBankInfo = function (updatingOrderBankInfo) {
    var where = {
        'where' : {'orderId' : updatingOrderBankInfo.orderId}
    };
    delete updatingOrderBankInfo.orderId;
    return dbUtil.executeModelFn(app.models.OrderBankInfo, 'updateAll', where, updatingOrderBankInfo);
};