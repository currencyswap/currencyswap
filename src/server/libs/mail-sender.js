'use strict';

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var errorUtil = require('./errors/error-util');
const errors = require('./errors/errors');
const appConfig = require('./app-config');
var async = require('async');
var util = require('util');

var exports = module.exports;

var sender = null;

var collectSMPTOptions = function (callback) {
    let options = appConfig.getSMTPOptions();

    if (!options) {
        if (!callback) return;
        let err = errorUtil.createAppError(errors.INVALID_SMTP_OPTIONS);
        return callback ? callback(err) : undefined;
    }

    return callback(null, options);
};

var initTransporter = function (options, callback) {

    let transporter = nodemailer.createTransport(smtpTransport(options));

    transporter.verify(function (error) {
        if (error) {
            console.error('ERROR : %s', error);
            let err = errorUtil.createAppError(errors.INVALID_SMTP_OPTIONS);
            err.message = error;
            return callback(err);
        }

        callback(null, transporter);

    });
};

exports.initMailSender = function (callback) {

    async.waterfall([
        collectSMPTOptions,
        initTransporter
    ], function (err, transporter) {
        if (err) {
            sender = null;
            return callback(err);
        }
        sender = transporter;
        callback(null, sender);
    });
};

/** 
 * mailOptions  = {
 *  from : '"Demo User" <demo@example.com>',
 *  to : '"Admin" <admin@example.com>',
 *  subject : 'Hello',
 *  text : 'Hello World', // Text Body
 *  html : '<b>Hello World</b>' // html body
 * }
 */
exports.sendMail = function (mailOptions, callback) {
    if (!sender) {
        let err = errorUtil.createAppError(errors.MAIL_SENDER_NOT_VAILABLE);
        return callback(err);
    }
    sender.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(util.inspect(error, {showHidden: false, depth: null}));
            let err = errorUtil.createAppError(errors.COULD_NOT_SEND_MAIL);
            err.message = error;
            return callback(err);
        }

        callback(null, info);
    });
};
