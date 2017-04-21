'use strict';

const messages = require('../../messages/messages');
const BASE64 = 'base64';
var exports = module.exports;
var crypto = require('crypto');

exports.getValue = function ( key, keyMap ) {
    var regex = /\{[_a-zA-Z][_0-9a-zA-Z]*\}/;

    if (regex.test(key)) {
        key = key.replace(/[\{\}]/g, '');
        return keyMap[key];
    }

    return key;
};

exports.getMessage = function (val) {
    return exports.getValue( val, messages );
};

exports.decodeBase64 = function (base64Str) {

    let buff = new Buffer( base64Str, BASE64 );

    return buff.toString();
};

exports.encryptString = function (plainText, algorithm, password, inputFormat, outputFormat) {
    var cipher = crypto.createCipher(algorithm, password);
    var encrypted = cipher.update(plainText, inputFormat, outputFormat);
    encrypted += cipher.final(outputFormat);
    return encrypted;
};

exports.decryptString = function (encryptedString, algorithm, password, inputFormat, outputFormat) {
    const decipher = crypto.createDecipher(algorithm, password);

    var decrypted = decipher.update(encryptedString, inputFormat, outputFormat);
    decrypted += decipher.final(outputFormat);
    return decrypted;
};
