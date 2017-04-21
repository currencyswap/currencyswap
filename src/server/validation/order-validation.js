var exports = module.exports;
var errorUtils = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');

exports.validateBankInfoObj = function (bankInfoObj) {
    if (!bankInfoObj || !bankInfoObj.bankAccountNumber || !bankInfoObj.bankAccountName || !bankInfoObj.bankName || !bankInfoObj.bankCountry) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }

    if (bankInfoObj.bankAccountNumber.length > 128
        || bankInfoObj.bankAccountName.length > 128
        || bankInfoObj.bankName.length > 128
        || bankInfoObj.bankCountry.length > 128) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }
};

exports.validateOrderBankInfoObj = function (orderBankInfoObj) {
    if (orderBankInfoObj.accepterBankInfoId) {
        try {
            parseInt(orderBankInfoObj.accepterBankInfoId)
        } catch (err) {
            throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
        }
    }

    if (orderBankInfoObj.initializerBankInfoId) {
        try {
            parseInt(orderBankInfoObj.initializerBankInfoId)
        } catch (err) {
            throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
        }
    }

    if (orderBankInfoObj.orderId) {
        try {
            parseInt(orderBankInfoObj.orderId)
        } catch (err) {
            throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
        }
    }
};
