'use strict';

var exports = module.exports;
var appConfig = require('../libs/app-config');
var dateFormat = require('dateformat');
var constant = require('../libs/constants/constants');
var errorUtils = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');

exports.convertUserToUserJSON = function (user) {

    let userJSON = user.toJSON();

    let userObj = {
        id: userJSON.id,
        username: userJSON.username,
        email: userJSON.email,
        fullName: userJSON.fullName,
        birthday: userJSON.birthday ? dateFormat(userJSON.birthday, appConfig.DATE_FORMAT) : null,
        expiredDate: userJSON.expiredDate ? dateFormat(userJSON.expiredDate, appConfig.DATE_FORMAT) : null,
        isBlocked: userJSON.isBlocked,
        isActivated: userJSON.isActivated,
        addresses: []
    };

    if (userJSON.addresses && userJSON.addresses.length > 0) {

        userJSON.addresses.forEach(function (address) {

            userObj.addresses.push({
                id: address.id,
                address: address.address,
                city: address.city,
                state: address.state,
                country: address.country,
                postcode: address.postcode
            });

        });
    }

    if (userJSON.groups && userJSON.groups.length > 0) {
        userObj.groups = [];
        userJSON.groups.forEach(function (group) {

            userObj.groups.push({
                id: group.id,
                name: group.name
            });

        });
    }

    return userObj;

};

exports.convertUserData = function (requestUser) {
    var resultUser = {};

    // Required field, can not submit without it.
    resultUser.username = requestUser.username;
    resultUser.password = requestUser.password;
    resultUser.email = requestUser.email;
    resultUser.addresses = [];

    //Default for new registration user
    resultUser.group = constant.USER_GROUPS.BLOCKED_USER_GR;
    resultUser.status = constant.USER_STATUSES.NEW;

    resultUser.expiredDate = new Date(Date.now()).toISOString();
    resultUser.registeredDate = new Date(Date.now()).toISOString();

    resultUser.banksInfo = [];

    if (requestUser.fullName) resultUser.fullName = requestUser.fullName;

    if (requestUser.birthday) resultUser.birthday = new Date(requestUser.birthday).toISOString();

    if (requestUser.cellphone) resultUser.cellphone = requestUser.cellphone;

    if (requestUser.profession) resultUser.profession = requestUser.profession;

    if (requestUser.nationalId) resultUser.nationalId = requestUser.nationalId;

    if (requestUser.addresses) resultUser.addresses = requestUser.addresses;

    if (requestUser.profession) resultUser.profession = requestUser.profession;

    if (requestUser.bankAccountName
        || requestUser.bankAccountNumber
        || requestUser.bankName
        || requestUser.bankCountry
			  || requestUser.bankSortCode
			  || requestUser.bankSwiftIbanCode) {
        resultUser.banksInfo.push({
            bankAccountName: requestUser.bankAccountName,
            bankAccountNumber: requestUser.bankAccountNumber,
            bankName: requestUser.bankName,
            bankCountry: requestUser.bankCountry,
					  bankSortCode: requestUser.bankSortCode,
					  bankSwiftIbanCode: requestUser.bankSwiftIbanCode
        })
    }

    /*if (requestUser.bankAccountNumber) resultUser.bankInfo.bankAccountNumber = requestUser.bankAccountNumber;

    if (requestUser.bankName) resultUser.bankInfo.bankName = requestUser.bankName;

    if (requestUser.bankCountry) resultUser.bankInfo.bankCountry = requestUser.bankCountry;*/

    if (requestUser.inviter) resultUser.inviter = requestUser.inviter;

    return resultUser;
};

exports.convertExRateValueToNumber = function (exRateObj) {
    try {
        exRateObj.usDollarBuy = parseInt(exRateObj.usDollarBuy);
        exRateObj.usDollarSell = parseInt(exRateObj.usDollarSell);
        exRateObj.poundBuy = parseInt(exRateObj.poundBuy);
        exRateObj.poundSell = parseInt(exRateObj.poundSell);
        exRateObj.euroBuy = parseInt(exRateObj.euroBuy);
        exRateObj.euroSell = parseInt(exRateObj.euroSell);
    } catch (err) {
        throw errorUtils.createAppError(errors.INVALID_INPUT_DATA);
    }
};

exports.changeCreatedDateToNow = function (exRateObj) {
    exRateObj.createdDate = new Date(Date.now());
    return exRateObj;
};
