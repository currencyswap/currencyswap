'use strict';

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

var encodeUserNameAndPasswordBase64 = function (username, password) {
    var usernameAndPassword = username + global.DELIMITER + password;
    return b64EncodeUnicode(usernameAndPassword);
};

var getInfoFormToken = function (token) {

    var arr = token.split('.');

    if (arr.length < 3) {
        console.error('Invalid Token %s', token);
        return null;
    }

    var decodedData = window.atob(arr[1]);
    var json = {};
    try {json = JSON.parse(decodedData);}catch(e){}
    return json;

};
