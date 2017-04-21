'use strict';
/**
 * @author Viet Nghiem
 */

var crypto = require('crypto');

var _defaultAlgorithm = 'sha256';// md5
var _defaultDigestType = 'hex';// base46
var _defaultEncode = 'utf8';

var _createHash = function(key, type) {
  type = (type || _defaultDigestType);
  var res = crypto.createHash(_defaultAlgorithm)
              .update(key, _defaultEncode).digest(type);
  return res;
};
module.exports.createHash = _createHash;
