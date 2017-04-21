/**
 * Created by dqlgnoleth on 11/01/2017.
 */

var errors = require('../libs/errors/errors');
var errorUtil = require('../libs/errors/error-util');
var async = require('async');
var constant = require('../libs/constants/constants');
var appConfig = require('../libs/app-config');
var stringUtil = require('../libs/utilities/string-util');
var gm = require('gm').subClass({imageMagick: true});
var fs = require("fs"); //Load the filesystem module
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var maxPaymentEvidenceFileSize = 5 * 1000 * 1000;

module.exports = function (app) {
    var router = app.loopback.Router();

    router.post('/', multipartMiddleware, function (req, res, next) {
        console.log('req.files: ', req.files);
        console.log('req.body: ', req.body);
        var file = req.files.file;
        var requestOptions = req.body;
        var currentUsername = req.currentUser.username;
        var plainPath = currentUsername + "|" + requestOptions.orderCode;
        var encryptedFilePath = stringUtil.encryptString(plainPath, constant.ENCRYPTION_ALGORITHM, constant.ENCRYPTION_PWD, 'utf8', 'hex');
        //step 1: check if file size is larger than max file size
        if (file.size > maxPaymentEvidenceFileSize) {
            console.error('image exceeds max file size');
            return res.status(400).send(errorUtil.createAppError(errors.INVALID_INPUT_DATA));
        }

        // step 2: check if file type is image
        if (file.type !== 'image/png' && file.type !== 'image/jpg' && file.type !== 'image/jpeg') {
            console.error('file is not an image');
            return res.status(400).send(errorUtil.createAppError(errors.INVALID_INPUT_DATA));
        }

        // step 3: check image size

        gm(file.path)
            .size(function (err, size) {
                if (!err) {
                    // step 4: resize image
                    if (size.width <= size.height) {
                        gm(file.path)
                            .resizeExact(300, 450)
                            .write(appConfig.getPaymentEvidenceFolder() + '/' + encryptedFilePath + '.png', function (err) {
                                if (!err) {
                                    // step 5: remove temp file in /tmp folder
                                    console.log('done');
                                    fs.unlink(file.path, function (err) {
                                        if (!err) console.log('delete temp uploaded file in tmp folder done');
                                        else console.error('error on deleting temp uploaded file in tmp folder')
                                    })
                                }
                                else {
                                    console.error(err);
                                    return res.status(500).send(err);
                                }
                            });
                    } else {
                        gm(file.path)
                            .resizeExact(450, 300)
                            .write(appConfig.getPaymentEvidenceFolder() + '/' + encryptedFilePath + '.png', function (err) {
                                if (!err) {
                                    // step 5: remove temp file in /tmp folder
                                    console.log('done');
                                    fs.unlink(file.path, function (err) {
                                        if (!err) console.log('delete temp uploaded file in tmp folder done');
                                        else console.error('error on deleting temp uploaded file in tmp folder')
                                    });
                                }
                                else {
                                    console.error(err);
                                    return res.status(500).send(err);
                                }
                            });
                    }
                } else {
                    console.error(err);
                    return res.status(400).send(err);
                }
            });
    });

    return router;
};