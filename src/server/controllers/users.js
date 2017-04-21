'use strict';

var async = require('async');
var util = require('util');

var errors = require('../libs/errors/errors');
var errorUtil = require('../libs/errors/error-util');
var userService = require('../services/user-service');
var constant = require('../libs/constants/constants');
var supportService = require('../services/support-service');
var userValidation = require('../validation/user-validation');

module.exports = function (app) {
    var router = app.loopback.Router();
    
    router.get('/', function (req, res) {
        userService.findAllUsers(function (err, users) {
            if (err) return res.status(299).send(err);
            else return res.status(200).send(users)
        })
    });
    router.get('/status/:status', function (req, res) {
        var status = req.params.status;
        userService.findUsersFollowStatus(status,function (err, users) {
            if (err) return res.status(299).send(err);
            else return res.status(200).send(users)
        })
    });

    router.get('/:id', function (req, res) {
        var userId = req.params.id;
        if ( !userId ) {

            var err = errorUtil.createAppError( errors.MEMBER_NO_USERID );

            return res.status(constant.HTTP_FAILURE_CODE).send( errorUtil.getResponseError( err ) );
        }

        userService.getUserDetail(userId, function (err, user) {
            if (err) {
                if (err.code === errorUtil.createAppError(errors.SERVER_GET_PROBLEM).code ) {
                    return res.status( constant.HTTP_FAILURE_CODE ).send(err);
                }

                return res.status( constant.HTTP_FAILURE_CODE ).send(err);

            } else {
                console.log('user information: ', user);
                return res.status(constant.HTTP_SUCCESS_CODE).send(user)
            }
        });
    });

    router.post('/:id', function (req, res) {
        var admin = req.currentUser;
        var updatingUser = req.body;
        try {
            userValidation.validateEditedProfileRequestObject(updatingUser);
        } catch (err) {
            return res.status(constant.HTTP_FAILURE_CODE).send(err);
        }

        async.waterfall([
            function (next) {
                userService.getUserByUsernameWithoutRelationModel(updatingUser, function (err, user) {
                    if (err) return next (err);
                    else {
                        return next (null, user);
                    }
                });
            },
            function (user, next) {
                if (!updatingUser.nationalId) {
                    return next (null, user);
                } else {
                    userService.getUserByNationalId(updatingUser, function (err, foundUser) {
                        if (err) {
                            if (err.code === errorUtil.createAppError(errors.NO_USER_FOUND_IN_DB).code) {
                                return next(null, user);
                            } else {
                                return next(err);
                            }
                        } else {
                            if (foundUser.username === updatingUser.username) return next (null, user);
                            return next (errorUtil.createAppError(errors.NATIONAL_ID_EXISTED));
                        }
                    });
                }
            },
            function (user, next) {
                if (!updatingUser.cellphone) {
                    return next(null, user);
                } else {
                    userService.getUserByCellphone(updatingUser, function (err, foundUser) {
                        if (err) {
                            if (err.code === errorUtil.createAppError(errors.NO_USER_FOUND_IN_DB).code) {
                                return next(null, user);
                            } else {
                                return next(err);
                            }
                        } else {
                            if (foundUser.username === updatingUser.username) return next (null, user);
                            return next (errorUtil.createAppError(errors.CELLPHONE_EXISTED))
                        }
                    })
                }
            },
            function (user, next) {
                if (!updatingUser.group) {
                    return next (null, user);
                } else {
                    // update role for user

                    // do not let admin update role for himself
                    var currentAdminId = admin.id;
                    if (user.id === parseInt(currentAdminId)) {
                        return next (errorUtil.createAppError(errors.CANNOT_SET_YOUR_OWN_ROLE));
                    }
                    else {
                        var updatingRole = updatingUser.group;
                        userService.updateRoleForUser(user, updatingRole, function (err) {
                            if (err) return next (err);
                            else return next (null, user);
                        });
                    }
                }
            },
            function createMessage(user, next) {
                if (user.status !== constant.USER_STATUSES.ACTIVATED && updatingUser.status === constant.USER_STATUSES.ACTIVATED) {
                    var message = {'title': constant.MSG.APPROVAL_TITLE, 
                            'message': constant.MSG.APPROVAL_CONTENT, 
                            'creatorId': admin.id, 'receiverId': user.id};
                    supportService.saveMessage(message);
                }else {
                    if(updatingUser.status !== constant.USER_STATUSES.BLOCKED && JSON.stringify(updatingUser) !== JSON.stringify(user)) {
                        var message = {'title': constant.MSG.ADMIN_EDITED_PROFILE_TITLE,
                            'message': constant.MSG.ADMIN_EDITED_PROFILE_CONTENT,
                            'creatorId': admin.id, 'receiverId': user.id};
                        supportService.saveMessage(message);
                    }
                }
                return next (null, user);
            },
            function (user, next) {
                if (updatingUser.addresses && updatingUser.addresses.length > 0  && (updatingUser.addresses[0].address
                    || updatingUser.addresses[0].city
                    || updatingUser.addresses[0].postcode
                    || updatingUser.addresses[0].state
                    || updatingUser.addresses[0].country)) {

                    user.addresses(function (err, addresses) {
                        if (err) {
                            return next(err);
                        }
                        else {
                            if (!addresses || addresses.length === 0) {
                                user.addresses.create(updatingUser.addresses, function (err, updatedUser) {
                                    if (err) return next(err);
                                    else {
                                        return next (null);
                                    }
                                })
                            } else {
                                app.models.Address.findById(addresses[0].id, function (err, address) {
                                    if (err) return next(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                                    else {
                                        if (!address) return next(errorUtil.createAppError(errors.CANNOT_FIND_ADDRESS_FOR_USER));
                                        else {
                                            address.updateAttributes(updatingUser.addresses[0], function (err, updatedAddresses) {
                                                if (err) return next(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                                                else {
                                                    var filter = {};
                                                    for (var prop in updatingUser) {
                                                        if (prop === 'username' || prop === 'id' || prop === 'email' || prop === 'addresses') continue;
                                                        if (prop === 'newPwd') filter.password = md5(updatingUser[prop]);
                                                        if (prop === 'expiredDate') {
                                                            if (new Date(updatingUser.expiredDate) < new Date(Date.now())) {
                                                                filter.status = constant.USER_STATUSES.EXPIRED;
                                                                updatingUser.status = constant.USER_STATUSES.EXPIRED;
                                                            }
                                                        }
                                                        filter[prop] = updatingUser[prop];
                                                    }
                                                    console.log('filter when saving 1: ', filter);
                                                    userService.updateUserInfo(user, filter, function (err, updatedUser) {
                                                        if (err) return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                                                        else {
                                                            return next (null);
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    });
                } else {
                    var filter = {};
                    for (var prop in updatingUser) {
                        if (prop === 'username' || prop === 'id' || prop === 'email' || prop === 'addresses') continue;
                        if (prop === 'newPwd') filter.password = md5(updatingUser[prop]);
                        if (prop === 'expiredDate') {
                            if (new Date(updatingUser.expiredDate) < new Date(Date.now())) {
                                updatingUser.status = constant.USER_STATUSES.EXPIRED;
                            }
                        }
                        filter[prop] = updatingUser[prop];
                    }
                    console.log('filter when saving 2: ', filter);
                    userService.updateUserInfo(user, filter, function (err, updatedUser) {
                        if (err) return next (errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                        else {
                            return next (null);
                        }
                    });
                }

            }
        ], function (err) {
            if (err) {
                res.status(constant.HTTP_FAILURE_CODE).send(err);
            }
            else res.status(constant.HTTP_SUCCESS_CODE).send({});
        });
    });

    router.put('/:username', function (req, res) {
        res.status(constant.HTTP_SUCCESS_CODE).send({});
    });

    return router;
};
