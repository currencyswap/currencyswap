'use strict';

var exports = module.exports;
var errorUtils = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var validator = require('validator');
var md5 = require('js-md5');

exports.validateRegisterRequestObject = function (clientUserObj) {

    var bankInfo = {
        accountName: clientUserObj.bankAccountName,
        accountNumber: clientUserObj.bankAccountNumber,
        bankName: clientUserObj.bankName,
        bankCountry: clientUserObj.bankCountry,
			  bankSortCode: clientUserObj.bankSortCode,
			  bankSwiftIbanCode: clientUserObj.bankSwiftIbanCode
    };

    exports.validateUsername(clientUserObj.username);
    exports.validatePassword(clientUserObj.password);
    exports.validateEmail(clientUserObj.email);
    exports.validateFullName(clientUserObj.fullName);
    exports.validateBirthDay(clientUserObj.birthday);
    exports.validateCellphone(clientUserObj.cellphone);
    exports.validateProfession(clientUserObj.profession);
    exports.validateNationalId(clientUserObj.nationalId);
    exports.validateAddresses(clientUserObj.addresses);
    exports.validateBankInfo(bankInfo);
    exports.validateInviter(clientUserObj.inviter);
};

exports.validateEditedProfileRequestObject = function (clientUserObj) {

    var bankInfo = {
        accountName: clientUserObj.bankAccountName,
        accountNumber: clientUserObj.bankAccountNumber,
        bankName: clientUserObj.bankName,
        bankCountry: clientUserObj.bankCountry,
			  bankSortCode: clientUserObj.bankSortCode,
			  bankSwiftIbanCode: clientUserObj.bankSwiftIbanCode
    };

    exports.validateUsername(clientUserObj.username);

    console.log("clientUserObj.currentPwd: ", clientUserObj.currentPwd);
    if (clientUserObj.newPwd && clientUserObj.passwordCompare && clientUserObj.currentPwd) {
        exports.validateEditedPassword(clientUserObj.currentPwd, clientUserObj.newPwd, clientUserObj.passwordCompare);
    }

    exports.validateEmail(clientUserObj.email);
    exports.validateFullName(clientUserObj.fullName);
    exports.validateBirthDay(clientUserObj.birthday);
    exports.validateCellphone(clientUserObj.cellphone);
    exports.validateProfession(clientUserObj.profession);
    exports.validateNationalId(clientUserObj.nationalId);
    exports.validateAddresses(clientUserObj.addresses);
    exports.validateBankInfo(bankInfo);
};

exports.validateUsername = function (username) {
    if (!username) {
        throw errorUtils.createAppError(errors.REQUEST_NO_USERNAME);
    }

    if (typeof username !== 'string') {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }

    if (username.length > 64) {
        throw errorUtils.createAppError(errors.USERNAME_EXCEED_MAX_LENGTH);
    }
};

exports.validatePassword = function (password) {
    if (!password) {
        throw errorUtils.createAppError(errors.REQUEST_NO_PASSWORD);
    }

    if (typeof password !== 'string') {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }

    if (password.length > 64) {
        throw errorUtils.createAppError(errors.PASSWORD_EXCEED_MAX_LENGTH);
    }
};

exports.validateEditedPassword = function (currentPassword, newPassword, confirmationPassword) {
    if (currentPassword.length < 8) {
        throw errorUtils.createAppError(errors.INVALID_PASSWORD);
    }

    if (typeof currentPassword !== 'string') {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }
    if ((md5(currentPassword)).length > 64) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }
    if (newPassword !== confirmationPassword) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }
    if (typeof newPassword !== 'string') {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }
    if (newPassword.length < 8 || (md5(newPassword)).length > 64) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }
};

exports.validateEmail = function (email) {
    if (!email) {
        throw errorUtils.createAppError(errors.REQUEST_NO_EMAIL);
    }

    if (typeof email !== 'string') {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }

    if (email.length > 64) {
        throw errorUtils.createAppError(errors.EMAIL_EXCEED_MAX_LENGTH);
    }

    if (!validator.isEmail(email)) {
        throw errorUtils.createAppError(errors.EMAIL_IS_INVALID);
    }
};

exports.validateFullName = function (fullName) {
    if (fullName) {
        if (typeof fullName !== 'string') {
            throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
        }

        if (fullName.length > 128) {
            throw errorUtils.createAppError(errors.FULLNAME_EXCEED_MAX_LENGTH);
        }
    }
};

exports.validateBirthDay = function (birthDay) {
    if (birthDay) {
        if (!validator.isDate(birthDay)) {
            throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
        }

        if (new Date(birthDay) > new Date(Date.now())) {
            throw errorUtils.createAppError(errors.BIRTHDAY_GREATER_THAN_CURRENT_DATE);
        }
    }
};

exports.validateCellphone = function (cellphone) {
    if (cellphone) {
        if (cellphone.length > 32) {
            throw errorUtils.createAppError(errors.CELLPHONE_EXCEED_MAX_LENGTH);
        }
    }
};

exports.validateProfession = function (profession) {
    if (profession) {
        if (profession.length > 256) {
            throw errorUtils.createAppError(errors.PROFESSION_EXCEED_MAX_LENGTH);
        }
    }
};

exports.validateNationalId = function (nationalId) {
    if (nationalId) {
        if (nationalId.length > 128) {
            throw errorUtils.createAppError(errors.NATIONALID_EXCEED_MAX_LENGTH);
        }
    }
};

exports.validateAddresses = function (addresses) {
    if (addresses) {
        if (!Array.isArray(addresses)) {
            throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
        }

        addresses.forEach(function (address) {
            if (address.name) {
                if (typeof address.address !== 'string' || address.address.length > 256) {
                    throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
                }

                if (typeof address.city !== 'string' || address.city.length > 128) {
                    throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
                }

                if (typeof address.state !== 'string' || address.state.length > 128) {
                    throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
                }

                if (typeof address.country !== 'string' || address.country.length > 128) {
                    throw errorUtils.createAppError(errors.INVALID_INPUT_TYPE);
                }

                if (typeof address.postcode !== 'string' || address.postcode.length > 64) {
                    throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
                }
            }
        })
    }
};

exports.validateBankInfo = function (bankInfo) {
    for (var key in bankInfo) {
        if (bankInfo[key]) {
            if (typeof bankInfo[key] !== 'string' || bankInfo[key].length > 128) {
                throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
            }
        }
    }
};

exports.validateUsernamePass = function (user, callback) {

    if (user === undefined || user === null) {
        return callback(errorUtils.createAppError(errors.INVALID_AUTHORIZATION_HEADER));
    }

    if (user.username === undefined) {
        return callback(errorUtils.createAppError(errors.MEMBER_NO_USERNAME));
    }

    if (user.password === undefined) {
        return callback(errorUtils.createAppError(errors.MEMBER_NO_PASSWORD));
    }

    callback(null);

};

exports.validateUserPass = function (user, callback) {

    if (user.username === undefined) {
        return callback(errorUtils.createAppError(errors.MEMBER_NO_USERNAME));
    }

    if (user.password === undefined) {
        return callback(errorUtils.createAppError(errors.MEMBER_NO_PASSWORD));
    }

    if (user.email === undefined) {
        return callback(errorUtils.createAppError(errors.MEMBER_NO_EMAIL));
    }

    callback(null);

};

exports.validateInviteRequest = function (inviter, inviteeEmail) {
    if (!inviter) {
        throw errorUtils.createAppError(errors.NO_INVITER);
    }

    if (typeof inviter !== 'string' || inviter.length > 64) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }

    if (!inviteeEmail) {
        throw errorUtils.createAppError(errors.REQUEST_NO_EMAIL);
    }

    if (typeof inviteeEmail !== 'string' || inviteeEmail.length > 64) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }

};

exports.validateInviter = function (inviter) {
    if (inviter) {
        if (typeof inviter !== 'string') {
            throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
        }

        if (inviter.length > 64) {
            throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
        }
    }
};

exports.validateExRateObj = function (exRateObj) {
    if (!exRateObj) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }

    if (!exRateObj.usDollarBuy
        || !exRateObj.usDollarSell
        || !exRateObj.poundBuy
        || !exRateObj.poundSell
        || !exRateObj.euroBuy
        || !exRateObj.euroSell) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }

    if (typeof exRateObj.usDollarBuy !== 'string'
        || typeof exRateObj.usDollarSell !== 'string'
        || typeof exRateObj.poundBuy !== 'string'
        || typeof exRateObj.poundSell !== 'string'
        || typeof exRateObj.euroBuy !== 'string'
        || typeof exRateObj.euroSell !== 'string') {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }
};
