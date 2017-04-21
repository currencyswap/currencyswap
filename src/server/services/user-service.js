'use strict';

var exports = module.exports;
var md5 = require('js-md5');
var errorUtil = require('../libs/errors/error-util');
var stringUtil = require('../libs/utilities/string-util');
var errors = require('../libs/errors/errors');
var app = require('../server');
var redis = require('../libs/redis');
var token = require('../libs/token');
var async = require('async');
var mailSender = require('../libs/mail-sender');
var constant = require('../libs/constants/constants');
var appConfig = require('../libs/app-config');
var crypto = require('crypto');
var routes = require('../routes').routes;
var os = require('os');
var userConverter = require('../converters/user-converter');
var groupService = require('../services/group-service');
var supportService = require('../services/support-service');
var dbUtil = require('../libs/utilities/db-util');

exports.createUser = function (user, callback) {
    user.password = md5(user.password);

    async.waterfall([
        function (next) {
            app.models.Member.beginTransaction({isolationLevel: app.models.Member.Transaction.READ_COMMITTED}, function (err, tx) {
                if (err) {
                    console.log('Error on transaction initialization');
                    return next(errorUtil.createAppError(errors.TRANSACTION_INIT_FAIL));
                } else {
                    var txObject = {transaction: tx};
                    return next(null, txObject)
                }
            })
        },
        function (txObject, next) {
            app.models.Member.create(user, txObject, function (err, instance) {
                if (err) {
                    console.log('Error on saving User to DB');
                    return next(errorUtil.createAppError(errors.COULD_NOT_SAVE_USER_TO_DB), txObject);
                } else {
                    return next(null, txObject, instance)
                }
            });
        },
        function (txObject, instance, next) {
            if (!user.addresses || user.addresses.length <= 0) {
                return next(null, txObject, instance);
            }

            user.addresses.forEach(function (addr) {
                addr.memberId = instance.id;
            });

            app.models.Address.create(user.addresses, txObject, function (err) {
                if (err) {
                    console.log('Error on saving addresses for user');
                    return next(errorUtil.createAppError(errors.COULD_NOT_SAVE_USER_ADDR_TO_DB), txObject);
                } else {

                }
                return next(err, txObject, instance);
            });
        },
        function (txObject, instance, next) {
            if (!user.groups || user.groups.length <= 0) {
                return next(null, txObject, instance);
            }

            var userGrps = [];

            user.groups.forEach(function (grp) {
                if (!grp.id) return;

                userGrps.push({
                    memberId: instance.id,
                    groupId: grp.id
                });
            });

            app.models.MemberGroup.create(userGrps, txObject, function (err) {
                if (err) {
                    console.log('Error on saving User Groups to DB');
                    return next(errorUtil.createAppError(errors.COULD_NOT_SAVE_USER_GR_TO_DB), txObject);
                } else {
                    return next(null, txObject, instance)
                }
            });

        }
    ], function (err, txObject, instance) {
        if (err) {
            txObject.transaction.rollback(function (rollbackErr) {
                if (rollbackErr) {
                    console.log('Fail to rollback transaction');
                    return callback(errorUtil.createAppError(errors.ERROR_TX_ROLLBACK));
                } else {
                    return callback(err);
                }
            });
        } else {
            txObject.transaction.commit(function (commitErr) {
                if (commitErr) {
                    console.log('Fail to commit transaction');
                    return callback(errorUtil.createAppError(errors.ERROR_TX_COMMIT));
                }
                else return callback(null, instance);
            });
        }
    });
};

exports.createUsers = function (users, callback) {

    var userObjs = [];

    async.eachSeries(users, function (user, next) {

        exports.createUser(user, function (err, instance) {
            if (err || !instance) return next(err, instance);
            userObjs.push(instance);
            next(null, instance);
        });

    }, function (err) {
        callback(err, userObjs);
    });
};


exports.getUserById = function (userId, callback) {
    app.models.Member.findByUserId(userId, function (err, userObj) {
        if (err) return callback(err);
        callback(null, userObj);
    });
};

exports.getUserByUsername = function (username, callback) {
    app.models.Member.findByUsername(username, function (err, userObj) {
        if (err) {
            return callback(err);
        }
        return callback(null, userObj);
    });
};

exports.getUserByUsernameWithPermissions = function (username, callback) {
    app.models.Member.findByUsernameWithPermissions(username, function (err, userObj) {
        if (err) return callback(err);
        callback(null, userObj);
    });
};

exports.login = function (user, callback) {

    async.waterfall([
        function (next) {
            app.models.Member.findByUsername(user.username, true, function (err, userObj) {
                if (err) return next(err);
                else {
                    if (!userObj) return next(err);

                    var password = md5(user.password);

                    // check password matched
                    if (userObj.password != password) {
                        return next(errorUtil.createAppError(errors.MEMBER_INVALID_PASSWORD));
                    }

                    if (userObj.status === constant.USER_STATUSES.NEW || userObj.status === constant.USER_STATUSES.PENDING_APPROVAL) {
                        return next(errorUtil.createAppError(errors.ACCOUNT_IS_NOT_ACTIVATED));
                    }

                    if (userObj.status === constant.USER_STATUSES.EXPIRED) {
                        return next(errorUtil.createAppError(errors.ACCOUNT_IS_EXPIRED));
                    }

                    if (userObj.status === constant.USER_STATUSES.BLOCKED) {
                        return next(errorUtil.createAppError(errors.ACCOUNT_IS_BLOCKED));
                    }

                    return next (null, userObj);
                }
            });
        },
        function (user, next) {
            // check expired date
            user.groups(function (err, groups) {
                if (err) return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                else {
                    groups.forEach(function (group) {
                        if (group.name === constant.USER_GROUPS.ADMIN_GR) {
                            return next (null, user);
                        } else {
                            var now = new Date(Date.now());
                            if (user.expiredDate && user.expiredDate < now) {
                                return next(errorUtil.createAppError(errors.ACCOUNT_IS_EXPIRED));
                            } else {
                                return next(null, user);
                            }
                        }
                    })
                }
            });
        },
        function (user, next) {
            // get User Secret Key
            redis.getSecretKey(user.username, function (err, value) {
                if (!err) return next(null, user, value);

                if (err.code != errors.MISSING_REDIS_KEY.code) {
                    return next(err);
                }

                // Generate Secret Key
                var secret = token.generateSecretKey(user.username);

                // Set to redis
                redis.setSecretKey(user.username, secret);
                return next(null, user, secret);
            });
        },
        function (user, secret, next) {
            var tokenKey = token.generate({username: user.username, fullName: user.fullName}, secret);

            token.getSignature(tokenKey, function (err, sign) {
                next(err, user, secret, tokenKey, sign);
            });

        },
        function (user, secret, tokenKey, sign, next) {
            redis.setSecretKeyBySignature(sign, JSON.stringify({username: user.username, secret: secret}));
            return next(null, tokenKey);
        }
    ], function (err, tokenKey) {
        callback(err, tokenKey);
    });

};

exports.verifyResetPwdInfo = function (email, options, callback) {
    async.waterfall([
        function (next) {
            // find user by email
            app.models.Member.findByEmail(email, function (err, user) {
                if (err) {
                    return next(errorUtil.createAppError(errors.MEMBER_EMAIL_NOT_FOUND));
                }
                return next(null, email, user, options);
            });
        },
        function (email, user, options, next) {
            // generate reset password code
            exports.generateRandomString(function (err, randomString) {
                if (err) return next(err);
                else {
                    return next(null, randomString, email, user, options);
                }
            });
        },
        function (randomString, email, user, options, next) {
            redis.set(email, randomString, constant.ONE_DAY_IN_SECONDS);
            return next(null, randomString, email, user, options);
        },
        function (randomString, email, user, options, next) {
            // construct mail options
            var senderInfo = appConfig.getMailSenderInfo();
            var resetLink = exports.constructResetUrl(randomString, email, options.protocolHostAndPort);

            var mailOptions = {
                from: senderInfo.sender,
                to: email,
                subject: 'CurrencySwap Password Reset',
                html: '<!DOCTYPE html>'
                + '<html lang="en">'
                + '<head>'
                + '<meta charset="UTF-8">'
                + '<title></title>'
                + '</head>'
                + '<body>'
                + '<p>Please use the below link to reset your password of account <b>' + user.username + '</b></p>'
                + '<a href="' + resetLink + '">RESET LINK</a>'
                + '<p>If you can not click on the link above, please help to copy below URL to your browser</p>'
                + '<p><a href="' + resetLink + '">' + resetLink + '</a></p>'
                + '<p>If you did not request this password change, please feel free to ignore it.</p>'
                + '<p>If you have any comments or questions, please do not hesitate to reach us at <b><u>' + senderInfo.sender + '</u></b></p>'
                + '<p><br></p>'
                + '<p>Thanks and best regards</p>'
                + '<p>Currency Swap</p>'
                + '</body>'
                + '</html>'
            };

            return next (null, mailOptions, options);
        },
        function (mailOptions, options, next) {
            mailSender.sendMail(mailOptions, function (err, info) {
                if (err) return next(errorUtil.createAppError(errors.COULD_NOT_SEND_MAIL));
                else {
                    return next(null);
                }
            });
        }
    ], function (err, updatedUser) {
        callback(err, updatedUser);
    });
};

exports.resetPassword = function (newPassword, requestResetCode, callback) {
    try {
        var emailAndRandomString = exports.extractEmailAndRandomString(requestResetCode);
    } catch (err) {
        return callback(err);
    }
    async.waterfall([
        function (next) {
            exports.updatePassword(emailAndRandomString.email, newPassword, function (err) {
                if (err) return next (err);
                else return next (null);
            })
        }, function (next) {
            redis.remove(emailAndRandomString.email);
            return next (null);
        }
    ], function (err) {
        callback(err);
    });
};

exports.generateRandomString = function (callback) {
    crypto.randomBytes(16, function (err, buf) {
        if (err) return callback(err);
        else return callback(null, buf.toString('hex'));

    });
};

exports.constructResetUrl = function (randomString, email, protocolHostAndPort) {
    var plainResetCode = email + constant.RESET_CODE_DELIMITER + randomString;
    var encryptedResetCode = stringUtil.encryptString(plainResetCode, constant.ENCRYPTION_ALGORITHM, constant.ENCRYPTION_PWD, 'utf8', 'hex');

    return protocolHostAndPort
        + constant.SLASH
        + constant.HASHTAG_AND_EXCLAMATION
        + constant.CLIENT_RESET_PWD_PATH
        + constant.QUESTION_MARK + constant.RESET_CODE_PARAM
        + '='
        + encryptedResetCode;
};

exports.constructActiveAccountUrl = function (randomString, username, protocolHostAndPort) {
    var plainActiveCode = username + constant.RESET_CODE_DELIMITER + randomString;
    var encryptedActiveCode = stringUtil.encryptString(plainActiveCode, constant.ENCRYPTION_ALGORITHM, constant.ENCRYPTION_PWD, 'utf8', 'hex');

    return protocolHostAndPort
        + constant.SLASH
        + constant.HASHTAG_AND_EXCLAMATION
        + constant.CLIENT_ACTIVE_ACC_PATH
        + constant.QUESTION_MARK + constant.ACTIVE_REGISTER_PARAM
        + '='
        + encryptedActiveCode;
};

exports.validateResetCode = function (redisResetCode, requestResetCode) {
    return (redisResetCode === requestResetCode);
};

exports.updatePassword = function (email, newPwd, callback) {
    async.waterfall([
        function (next) {
            app.models.Member.findByEmail(email, function (err, user) {
                if (err) return next(errorUtil.createAppError(errors.MEMBER_EMAIL_NOT_FOUND));
                else return next (null, user, newPwd);
            })
        },
        function (user, newPwd, next) {
            var md5Password = md5(newPwd);
            user.updateAttribute(constant.PASSWORD_FIELD, md5Password, function (err, updatedUser) {
                if (err) return next(errorUtil.createAppError(errors.COULD_NOT_UPDATE_USER_PWD));
                else return next(null);
            })
        }
    ], function (err) {
        callback(err)
    });
};

exports.createUserTransaction = function (callback) {
    app.models.Member.beginTransaction (function (err, tx) {
        if (err) return callback(err);
        else return callback(null, tx);
    });
};

    exports.registerUser = function (newUser, options, callback) {
    async.waterfall([
        function (next) {
            groupService.findGroupByName(newUser.group, function (err, group) {
                if (err) {
                    return next(err);
                } else {
                    newUser.groups = [{
                        id: group.id,
                        name: group.name
                    }];
                    return next(null, newUser, options);
                }

            })
        },
        function (newUser, options, next) {
            var checkingFields = [constant.MEMBER_DB_FIELD.USERNAME, constant.MEMBER_DB_FIELD.EMAIL, constant.MEMBER_DB_FIELD.NATIONALID, constant.MEMBER_DB_FIELD.CELLPHONE];
            exports.checkExistedUserInfo(newUser, function (err) {
                if (err) {
                    return next (err)
                } else {
                    return next (null, newUser, options);
                }
            }, checkingFields);
        },
        function (user, options, next) {
            exports.createUser(user, function (err, savedUser) {
                if (err) {
                    return next(err);
                }
                else return next(null, savedUser, options);
            })
        },
        function (savedUser, options, next) {
            if (newUser.inviter) {
                var inviter = newUser.inviter;
                app.models.Member.findByUsername(inviter, function (err, inviterObj) {
                    if (err) {
                        return next(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                    } else {
                        var invitations = [
                            {
                                inviterId: inviterObj.id,
                                inviteeId: savedUser.id
                            }
                        ];
                        app.models.Invitations.create(invitations, function (err, invitationObj) {
                            if (err) {
                                console.error('Error on saving invitations !!!');
                                return next(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                            } else {
                                return next(null, savedUser, options);
                            }
                        })
                    }
                });
            } else {
                return next (null, savedUser, options);
            }
        },
        function (savedUser, options, next) {
            if (!newUser.banksInfo) {
                return next (null, savedUser, options);
            }

            newUser.banksInfo.forEach(function (bankInfo) {
                bankInfo.memberId = savedUser.id;
            });

            app.models.BankInfo.create(newUser.banksInfo, function (err, savedBankInfo) {
                if (err) {
                    console.error('Error on saving bank info of user');
                    return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                } else {
                    return next (null, savedUser, options);
                }
            });
        },
        function createMessage(savedUser, options, next) {
            supportService.messageToGroup({'title': constant.MSG.NEW_MEMBER_TITLE,
                'message': constant.MSG.NEW_MEMBER_CONTENT, 
                'groupName': 'Admin', 
                'creatorId': savedUser.id});
            return next(null, savedUser.username, savedUser.email, options);
        },
        function (username, email, options, next) {
            exports.generateRandomString(function (err, randomString) {
                if (err) return next(err);
                else {
                    return next(null, randomString, username, email, options);
                }
            });
        },
        function (randomString, username, email, options, next) {
            redis.get(username, function (err, response) {
                if (err) {
                    if (err.code === errorUtil.createAppError(errors.SERVER_GET_PROBLEM).code) return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                    if (err.code === errorUtil.createAppError(errors.MISSING_REDIS_KEY).code) {
                        redis.set(username, randomString, constant.ONE_DAY_IN_SECONDS);
                        return next(null, randomString, username, email, options);
                    }
                } else {
                    redis.remove(username);
                    redis.set(username, randomString, constant.ONE_DAY_IN_SECONDS);
                    return next(null, randomString, username, email, options);
                }
            });
        },
        function (randomString, username, email, options, next) {
            // construct mail options
            var senderInfo = appConfig.getMailSenderInfo();
            var activeLink = exports.constructActiveAccountUrl(randomString, username, options.protocolHostAndPort);

            var mailOptions = {
                from: senderInfo.sender,
                to: email,
                subject: 'CurrencySwap Registration',
                html: '<!DOCTYPE html>'
                + '<html lang="en">'
                + '<head>'
                + '<meta charset="UTF-8">'
                + '<title></title>'
                + '</head>'
                + '<body>'
                + '<p>Please use the below link to process your registration with username <b>' + username + '</b></p>'
                + '<a href="' + activeLink + '">Active URL</a><br>'
                + '<p>If you can not click on the link above, please help to copy below URL to your browser</p>'
                + '<p><a href="' +activeLink+'">' +activeLink+ '</a></p>'
                + '<p>If you have not register to Currency Swap recently, please feel free to ignore it.</p>'
                + '<p>If you have any comments or questions, please do not hesitate to reach us at <b><u>' + senderInfo.sender + '</u></b></p>'
                + '<p><br></p>'
                + '<p>Thanks and best regards</p>'
                + '<p>Currency Swap</p>'
                + '</body>'
                + '</html>'
            };

            return next(null, mailOptions, options);
        },
        function (mailOptions, options, next) {
            console.log('registerUser 11');
            // send notification email to client
            mailSender.sendMail(mailOptions, function (err, info) {
                if (err) return next(errorUtil.createAppError(errors.ERR_COULD_NOT_SEND_MAIL));
                else {
                    return next(null);
                }
            });
        }
    ], function (err, savedUser) {
        callback(err, savedUser);
    });
};

exports.findAllUsers = function (callback) {
    app.models.Member.findAll(function (err, users) {
        var resultUser = [];
        if (err) return callback(err);
        else {
            users.forEach(function (user) {
                if (user.status !== constant.USER_STATUSES.NEW) {
                    resultUser.push(user);
                }
            });
            return callback(null, resultUser);
        }
    })
};

exports.findUsersFollowStatus = function (status,callback) {
    app.models.Member.findUsersFollowStatus(status,function (err, users) {
        if (err) return callback(err);
        else return callback(null, users);
    })
};

exports.extractEmailAndRandomString = function (requestResetCode) {
    try {
        var decryptedString = stringUtil.decryptString(requestResetCode, constant.ENCRYPTION_ALGORITHM, constant.ENCRYPTION_PWD, 'hex', 'utf8');
    } catch (decryptionErr) {
        console.error('ERR: Can not decrypt reset password code: ', decryptionErr);
        throw errorUtil.createAppError(errors.COULD_NOT_DECRYPT_RESET_PWD_CODE);
    }

    var email = decryptedString.split(constant.RESET_CODE_DELIMITER)[0];
    var randomString = decryptedString.split(constant.RESET_CODE_DELIMITER)[1];

    return {
        email: email,
        randomString: randomString
    }
};

exports.extractUsernameAndRandomString = function (requestActiveCode) {
    var decryptedString = stringUtil.decryptString(requestActiveCode, constant.ENCRYPTION_ALGORITHM, constant.ENCRYPTION_PWD, 'hex', 'utf8');
    var username = decryptedString.split(constant.RESET_CODE_DELIMITER)[0];
    var randomString = decryptedString.split(constant.RESET_CODE_DELIMITER)[1];

    return {
        username: username,
        randomString: randomString
    }
};

exports.activeUserAccount = function (activeCode, callback) {
    try {
        var usernameAndRandomString = exports.extractUsernameAndRandomString(activeCode);
    } catch (err) {
        console.error(err);
        return callback (errorUtil.createAppError(errors.COULD_NOT_DECRYPT_ACTIVE_ACC_CODE));
    }

    async.waterfall([
        function (next) {
            redis.checkActiveCode(usernameAndRandomString.username, usernameAndRandomString.randomString, function (err, response) {
                if (err) return next(err);
                else return next(null, usernameAndRandomString.username);
            })
        },
        function (username, next) {
            app.models.Member.findUserByUserName(username, function (err, user) {
                if (err) return next(err);
                else {
                    return next (null, user);
                }
            })
        },
        function (user, next) {
            user.updateAttribute(constant.STATUS_FIELD, constant.USER_STATUSES.PENDING_APPROVAL, function (err, response) {
                if (err) return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                else {
                    return next (null, user);
                }
            });
        }, function (user, next) {
            exports.updateRoleForUser(user, constant.USER_GROUPS.STANDARD_USER_GR, function (err) {
                if (err) return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                else {
                    return next (null);
                }
            });
        }, function (next) {
            redis.remove(usernameAndRandomString.username);
            return next (null);
        }
    ], function (err) {
        callback(err)
    });
};

exports.getUserDetail = function (userId, callback) {
    app.models.Member.findByUserId(userId, function (err, user) {
        return callback( err, user );
    })
};

exports.getUserByUsernameWithoutRelationModel = function (user, callback) {
    app.models.Member.findByUsername(user.username, function (err, userObj) {
        
        if (err) return errorUtil.createAppError(errors.SERVER_GET_PROBLEM);

        if (!userObj) return errorUtil.createAppError(errors.NO_USER_FOUND_IN_DB);

        return callback(null, userObj);
    });
};

var _cleanExpiredOrBlockedUserSession = function(user) {
    if (user.status === constant.USER_STATUSES.BLOCKED || user.status === constant.USER_STATUSES.EXPIRED) {
        redis.removeUserInfo(user.username);
    } else if (user.expiredDate) {
        var now = new Date();
        var expire = (typeof user.expiredDate === 'string' ? new Date(user.expiredDate) : user.expiredDate);
        now = now.getTime();
        expire = expire.getTime();
        if (expire < now) {
            console.log('User get expired', user.username, 'Expired Time:', user.expiredDate);
            redis.removeUserInfo(user.username);
        }
    }
};
exports.updateUserInfo = function (user, filter, callback) {
    var oldUserStatus = user.status;
    user.updateAttributes(filter, function (err, updatedUser) {
        if (err) {
            return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        }
        else {
            _cleanExpiredOrBlockedUserSession(updatedUser);
            if (oldUserStatus === constant.USER_STATUSES.PENDING_APPROVAL && updatedUser.status === constant.USER_STATUSES.ACTIVATED) {
                async.waterfall([
                    function (next) {
                        // construct mail options
                        var senderInfo = appConfig.getMailSenderInfo();

                        var mailOptions = {
                            from: senderInfo.sender,
                            to: updatedUser.email,
                            subject: 'You account has been activated by Administrator',
                            html: '<!DOCTYPE html>'
                            + '<html lang="en">'
                            + '<head>'
                            + '<meta charset="UTF-8">'
                            + '<title>Account Approval</title>'
                            + '</head>'
                            + '<body>'
                            + '<p>Your account <b>' +updatedUser.username+ '</b> has been activated by Administrator, from now on, You can use your account to login to Currency Swap system.</p>'
                            + '<p>Thanks and best regards</p>'
                            + '<p>Currency Swap</p>'
                            + '</body>'
                            + '</html>'
                        };

                        return next (null, mailOptions);
                    },
                    function (mailOptions, next) {
                        mailSender.sendMail(mailOptions, function (err, info) {
                            if (err) {
                                return next(err);
                            }
                            else {
                                return next(null);
                            }
                        });
                    }
                ], function (err) {
                    if (err) {
                        return callback(err);
                    }
                    else return callback(null, updatedUser);
                });
            } else {
                return callback(null, updatedUser);
            }
        }
    });
};

exports.updateAddress = function (addressId, address, callback) {
    app.models.Address.updateAddress(addressId, address, function (err, updatedAddress) {
        if (err) return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        else {
            return callback(null, updatedAddress);
        }
    })
};

exports.getUserByNationalId = function (user, callback) {
    app.models.Member.findUserByNationalId(user.nationalId, function (err, userObj) {
        if (err) return callback(err);
        else return callback(null, userObj);
    })
};

exports.getUserByCellphone = function (user, callback) {
    app.models.Member.findUserByCellphone(user.cellphone, function (err, userObj) {
        if (err) return callback(err);
        else return callback(null, userObj);
    })
};

exports.checkExpiredDateUse = function (user, callback) {
    app.models.Member.findByUsername(user.username, function (err, userObj) {
        if (err) return callback(err);
        callback(null, userObj);
    });
};

exports.deleteUserAndRelatedAddresses = function (userInstance, callback) {
    async.waterfall([
        function (next) {
            // find address with user instance
            userInstance.addresses(function (err, address) {
                if (err) return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                else {
                    if (!address || address.length <= 0) return next (null);
                    else {
                        // delete address of this instance
                        app.models.Address.destroyById(address[0].id, function (err) {
                            if (err) {
                                return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                            }
                            else return next (null);
                        });
                    }
                }
            })
        },
        function (next) {
            userInstance.destroy(function (err) {
                if (err) return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                else return next (null);
            });
        }
    ], function (err) {
        callback(err)
    });
};

exports.checkResetPwdCode = function (resetCode, callback) {
    try {
        var emailAndRandomString = exports.extractEmailAndRandomString(resetCode);
    } catch (err) {
        return callback(err);
    }

    redis.checkResetCode(emailAndRandomString.email, emailAndRandomString.randomString, function (err, response) {
        if (err) return callback(err);
        else return callback(null);
    });
};

exports.updateRoleForUser = function (user, updatingRole, callback) {
    user.groups(function (err, groupsOfMember) {
        app.models.Group.findById(groupsOfMember[0].groupId, function (err, currentGroup) {
            if (currentGroup && updatingRole === currentGroup.name) {
                return callback(null);
            } else {
                groupService.findGroupByName(updatingRole, function (err, group) {
                    if (err) return callback (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                    if (!group) return callback (errorUtil.createAppError(errors.UNKNOWN_GROUP));

                    app.models.MemberGroup.findById(groupsOfMember[0].id, function (err, memGrp) {
                        if (err) return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));

                        memGrp.updateAttribute(constant.MEMBER_GROUP_MODEL_FIELD.GROUP_ID, group.id, function (err, updatedGrpMember) {
                            if (err) {
                                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                            } else {
                                redis.removeUserInfo(user.username);
                                return callback(null, updatedGrpMember);
                            }
                        })
                    });
                })
            }
        });
    })
};
exports.getExpiredUsers = function (time, limitTime) {
    var filter = {
            'where': {
            and: [
                  {'expiredDate': {'lt': time}},
                  { 'status': constant.USER_STATUSES.ACTIVATED }
            ]
    }
    };
    if (limitTime) {
        filter.where.and.push({'expiredDate': {'gt': limitTime}});
    }
    return dbUtil.executeModelFn(app.models.Member, 'find', filter);
};
exports.setUserExpired = function (userId, time) {
    var item = { 'status': constant.USER_STATUSES.EXPIRED };
    var where = { and: [{ 'id': userId }, {'expiredDate': {'lt': time}}, { 'status': constant.USER_STATUSES.ACTIVATED }] };
    return dbUtil.executeModelFn(app.models.Member, 'updateAll', where, item);
};

exports.checkUserExistWithEmail = function (email, callback) {
    app.models.Member.findByEmail(email, function (err, user) {
        if (err) {
            if (err.code === (errorUtil.createAppError(errors.MEMBER_EMAIL_NOT_FOUND)).code) {
                return callback(null, false);
            }
            return callback (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        } else {
            return callback(null, true);
        }
    });
};

exports.generateInvitationLink = function (inviter, inviteeEmail, protocolHostAndPort) {

    var base64InviterAndEmail = new Buffer(inviter + constant.INVITATION_CODE_DELIMITER + inviteeEmail).toString('base64');

    return protocolHostAndPort
        + constant.SLASH
        + constant.HASHTAG_AND_EXCLAMATION
        + constant.CLIENT_INVITATION_PATH
        + constant.QUESTION_MARK + constant.INVITAION_PARAM
        + '='
        + base64InviterAndEmail;
};

exports.sendInvitationMail = function (invitationLink, inviter, inviteeEmail, callback) {
    var senderInfo = appConfig.getMailSenderInfo();

    async.waterfall([
        function (next) {
            var mailOptions = {
                from: senderInfo.sender,
                to: inviteeEmail,
                subject: 'Currency Swap Invitation',
                html: '<!DOCTYPE html>'
                + '<html lang="en">'
                + '<head>'
                + '<meta charset="UTF-8">'
                + '<title></title>'
                + '</head>'
                + '<body>'
                + '<p>You has received an invitation from Currency Swap user: <b>' + inviter + '</b>, to join Currency Swap system</p>'
                + '<p><a href="' + invitationLink + '">Invitation URL</a></p>'
                + '<p>If you can not click on the link above, please help to copy below URL to your browser</p>'
                + '<p><a href="' +invitationLink+'">' +invitationLink+ '</a></p>'
                + '<p>If you have not register to Currency Swap recently, please feel free to ignore it.</p>'
                + '<p>If you have any comments or questions, please do not hesitate to reach us at <b><u>' + senderInfo.sender + '</u></b></p>'
                + '<p><br></p>'
                + '<p>Thanks and best regards</p>'
                + '<p>Currency Swap</p>'
                + '</body>'
                + '</html>'
            };

            return next (null, mailOptions);
        },
        function (mailOptions, next) {
            mailSender.sendMail(mailOptions, function (err) {
                if (err) {
                    return next(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                }
                else {
                    return next(null);
                }
            });
        }
    ], function (err) {
        callback(err);
    });
};
/*
exports.checkExistedUserInfo = function (requestUser, callback) {
    var orOptions = [];
    if (requestUser.username) {
        orOptions.push({'username': requestUser.username});
    }
    if (requestUser.nationalId) {
        orOptions.push({'nationalId': requestUser.nationalId})
    }
    if (requestUser.cellphone) {
        orOptions.push({'cellphone': requestUser.cellphone})
    }
    if (requestUser.email) {
        orOptions.push({'email': requestUser.email})
    }
    app.models.Member.findOne({
        where: {
            or: orOptions
        }
    }, function (err, user) {
        if (err) {
            return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        } else {
            if (!user) {
                return callback(null);
            } else {
                if (user.username === requestUser.username) {
                    return callback(errorUtil.createAppError(errors.USER_NAME_EXISTED))
                }

                if (user.email === requestUser.email) {
                    return callback(errorUtil.createAppError(errors.EMAIL_EXISTED))
                }

                if (user.nationalId && user.nationalId === requestUser.nationalId) {
                    return callback(errorUtil.createAppError(errors.NATIONAL_ID_EXISTED))
                }

                if (user.cellphone && user.cellphone === requestUser.cellphone) {
                    return callback(errorUtil.createAppError(errors.CELLPHONE_EXISTED))
                }
            }
        }
    })
};*/

exports.checkExistedUserInfo = function (requestUser, callback, checkingFields) {
    var orOptions = [];

    if (checkingFields.indexOf(constant.MEMBER_DB_FIELD.USERNAME) > -1) {
        orOptions.push({'username': requestUser.username});
    }
    if (checkingFields.indexOf(constant.MEMBER_DB_FIELD.NATIONALID) > -1) {
        orOptions.push({'nationalId': requestUser.nationalId})
    }
    if (checkingFields.indexOf(constant.MEMBER_DB_FIELD.CELLPHONE) > -1) {
        orOptions.push({'cellphone': requestUser.cellphone})
    }
    if (checkingFields.indexOf(constant.MEMBER_DB_FIELD.EMAIL) > -1) {
        orOptions.push({'email': requestUser.email})
    }
    if (orOptions.length === 0) {
        return callback(null);
    } else {
        app.models.Member.findOne({
            where: {
                or: orOptions
            }
        }, function (err, user) {
            if (err) {
                return callback(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            } else {
                if (!user) {
                    return callback(null);
                } else {
                    console.log('returned user: ', user);
                    if (user.username === requestUser.username) {
                        return callback(errorUtil.createAppError(errors.USER_NAME_EXISTED))
                    }

                    if (user.email === requestUser.email) {
                        return callback(errorUtil.createAppError(errors.EMAIL_EXISTED))
                    }

                    if (user.nationalId && user.nationalId === requestUser.nationalId) {
                        return callback(errorUtil.createAppError(errors.NATIONAL_ID_EXISTED))
                    }

                    if (user.cellphone && user.cellphone === requestUser.cellphone) {
                        return callback(errorUtil.createAppError(errors.CELLPHONE_EXISTED))
                    }

                    if (user.cellphone && user.cellphone === requestUser.cellphone) {
                        return callback(errorUtil.createAppError(errors.CELLPHONE_EXISTED))
                    }
                }
            }
        })
    }
};

exports.checkExistedBankAccountNumber = function (bankAccountNumber, callback) {
    app.models.BankInfo.findOne({
        where: {
            bankAccountNumber: bankAccountNumber
        }
    }, function (err, bankInfo) {
       if (err) {
           return callback(err);
       } else {
           if (!bankInfo) {
               return callback(null);
           } else {
               return callback(errorUtil.createAppError(errors.BANK_ACC_NUM_EXISTED));
           }
       }
    });
};

exports.updateBankInfoExisted = function (bankInfoUpdate) {
		var where = {
			'where' : {'id' : bankInfoUpdate.id}
		};
	  app.models.BankInfo.updateAll({
				where: {
					id: bankInfoUpdate.id
				}
		},bankInfoUpdate, function (err, bankInfo) {
				if (err) {
						console.log("err==",err);
				} else {
						console.log("bankInfo==",bankInfo);
				}
		});
		// return dbUtil.executeModelFn(app.models.BankInfo, 'updateAll', where, bankInfoUpdate);
};