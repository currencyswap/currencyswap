'use strict';

var userService = require('../services/user-service');
var userConverter = require('../converters/user-converter');
var constant = require('../libs/constants/constants');
var userValidation = require('../validation/user-validation');

module.exports = function (app) {
    var router = app.loopback.Router();
    var options = {};
    router.post('/', function (req, res) {
        // handle active user account request
        if (req.body.activeCode) {
            var activeCode = req.body.activeCode;
            userService.activeUserAccount(activeCode, function (err, response) {
                if (err) {
                    return res.status(constant.HTTP_FAILURE_CODE).send(err);
                }
                else {
                    return res.status(constant.HTTP_SUCCESS_CODE).send({});
                }
            });
        } else {
            // handle register request
            var protocolHostAndPort = req.protocol + '://' + req.get('host');
            options.protocolHostAndPort = protocolHostAndPort;

            var clientUserData = req.body.newUser;
            try {
                userValidation.validateRegisterRequestObject(clientUserData);
                var serverUserData = userConverter.convertUserData(clientUserData);
            } catch (err) {
                return res.status(constant.HTTP_FAILURE_CODE).send(err);
            }

            userService.registerUser(serverUserData, options, function (err) {
                if (err) {
                    return res.status(constant.HTTP_FAILURE_CODE).send(err);
                } else {
                    return res.status(constant.HTTP_SUCCESS_CODE).send({});
                }
            });
        }
    });

    return router;
};