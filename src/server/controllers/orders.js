'use strict';

var AppError = require('../libs/errors/app-error');
var errors = require('../libs/errors/errors');
var stringUtil = require('../libs/utilities/string-util');
var messages = require('../messages/messages');
var constant = require('../libs/constants/constants');
var service = require('../services/order-service');
var bankService = require('../services/bankInfo-service');
var statusTypeService = require('../services/status-type-service');
var orderConverter = require('../converters/order-converter');
var appConfig = require('../libs/app-config');
var util = require('util');
var cryptoUtil = require('../libs/utilities/crypto_util'); 
var supportService = require('../services/support-service');
var orderValidation = require('../validation/order-validation');
var CODE_LENGTH = 10;
module.exports = function (app) {
    var router = app.loopback.Router();

    var generateCode = function(id){
        var key = id + (new Date()) + Math.random();
        return cryptoUtil.createHash(key).substring(0, CODE_LENGTH);
    }

    
    var saveMessage = function(title, content, creatorId, receiverId, orderCode){
        //console.log('saveMessage', title, content)
//      Send 1 message to 1 user
        var message = {'title': title, 
            'message': content, 
            'creatorId': creatorId, 'receiverId': receiverId, 'orderCode': orderCode}
        supportService.saveMessage(message);
    }

    var getStatusName = function(statId) {
        switch (statId) {
        case constant.STATUS_TYPE.SUBMITTED_ID:
            return constant.STATUS_TYPE.SUBMITTED;
        case constant.STATUS_TYPE.SWAPPING_ID:
            return constant.STATUS_TYPE.SWAPPING;
        case constant.STATUS_TYPE.CONFIRMED_ID:
            return constant.STATUS_TYPE.CONFIRMED;
        case constant.STATUS_TYPE.PENDING_ID:
            return constant.STATUS_TYPE.PENDING;
        case constant.STATUS_TYPE.CLEARED_ID:
            return constant.STATUS_TYPE.CLEARED;
        case constant.STATUS_TYPE.CANCELED_ID:
            return constant.STATUS_TYPE.CANCELED;
        case constant.STATUS_TYPE.EXPIRED_ID:
            return constant.STATUS_TYPE.EXPIRED;
        }
    };
    var getOrderMsg = function(order) {
        var msg = 'Order: ' + order.code + ', Buy: ' + order.give + ' ' + order.giveCurrency.code+ '-' + order.giveCurrency.name
        + ', Sell: ' + order.get + ' ' + order.getCurrency.code+ '-' + order.getCurrency.name +', Rate: ' + order.rate;
        return msg;
    };
    var updateOrderStatus = function (req, res, statusId, activityMessage) {
        var initializerBankInfoData = req.query;
        var userId = req.currentUser.id;
        var orderId = req.params.id;
        var updatingOrderBankInfoData = {orderId: orderId};
        var creatorId = req.currentUser.id;
        service.getOrderById(orderId).then(function (order) {
            if (order) {
                order = order.toJSON();
            }
            var ownerId = order.ownerId;
            var accepterId = order.accepterId;
            var msgReceiverUserId = (creatorId == ownerId ? accepterId : ownerId);
            var title = null;
            var msg = null;
            if (statusId == constant.STATUS_TYPE.SUBMITTED_ID) {
                title = 'Order ' + order.code + ' has been cancelled';
                msg = getOrderMsg(order) + ' has been cancelled';
            } else {
                title = 'Order ' + order.code + ' has updated';
                msg = getOrderMsg(order) + ' has been changed from ' + getStatusName(order.statusId) + ' to ' + getStatusName(statusId);
            }
            if (order.statusId == statusId) {
                return res.send({isError: true, message: msg});
            } else {
                if (statusId > constant.STATUS_TYPE.SUBMITTED_ID) {
                    if (order.statusId == constant.STATUS_TYPE.SUBMITTED_ID) {
                        msg = getOrderMsg(order) + ' has been cancelled';
                        return res.send({isError: true, message: msg});
                    } else if (order.statusId >= statusId) {
                        msg = getOrderMsg(order) + ' has been changed from ' + getStatusName(order.statusId) + ' to ' + getStatusName(statusId);
                        return res.send({isError: true, message: msg})
                    }
                }

                if (order.statusId === constant.STATUS_TYPE.SWAPPING_ID && statusId === constant.STATUS_TYPE.SUBMITTED_ID) {
                    //remove order bank info record
                    service.removeOrderBankInfo(orderId);
                }

                if (order.statusId === constant.STATUS_TYPE.SWAPPING_ID && statusId === constant.STATUS_TYPE.CONFIRMED_ID) {
                    // save new bank info of order
                    if (!initializerBankInfoData.bankAccountName
                        || !initializerBankInfoData.bankAccountNumber
                        || !initializerBankInfoData.bankName
                        || !initializerBankInfoData.bankCountry) {
                        updatingOrderBankInfoData.initializerBankInfoId = initializerBankInfoData.choosenExistedBankInfoId;
                        try {
                            orderValidation.validateOrderBankInfoObj(updatingOrderBankInfoData);
                        } catch (err) {
                            return res.status(400).send(err);
                        }
                        bankService.updateOrderBankInfo(updatingOrderBankInfoData)
                            .then(function (resp) {
                                console.log('resp: ', resp);
                                return res.status(200).send({});
                            }, function (err) {
                                console.error(err);
                                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                            })
                    } else {

                        initializerBankInfoData.memberId = userId;
                        delete initializerBankInfoData.choosenExistedBankInfoId;
                        try {
                            orderValidation.validateBankInfoObj(initializerBankInfoData);
                            orderValidation.validateOrderBankInfoObj(updatingOrderBankInfoData);
                        } catch (err) {
                            return res.status(400).send(err);
                        }
                        // save order bank info data
                        bankService.createNewBankInfo(initializerBankInfoData)
                            .then(function (resp) {
                                updatingOrderBankInfoData.initializerBankInfoId = resp.id;
                                bankService.updateOrderBankInfo(updatingOrderBankInfoData)
                                    .then(function (resp) {
                                        return res.status(200).send({});
                                    }, function (err) {
                                        console.error(err);
                                        return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                                    });
                            }, function (err) {
                                console.error(err);
                                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                            });
                    }
                }

                service.updateOrderStatus(orderId, statusId, creatorId).then(function (resp) {
                    if (statusId == constant.STATUS_TYPE.SUBMITTED_ID) {
                        service.removeOrderActivity(orderId);
                    } else {
                        createOrderActivity(orderId, creatorId, statusId, activityMessage);
                    }
                    if (msgReceiverUserId) {
                        saveMessage(title, msg, creatorId, msgReceiverUserId, order.code);
                    } else {
                        console.log('No message was sent due to unknown receiver')
                    }
                    return res.send(resp);
                }, function (err) {
                    return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                });
            }


        }, function (err) {
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    };
    var createOrderActivity = function (orderId, creatorId, statusId, description){
        service.createOrderActivity(orderId, creatorId, statusId, description).then(function(resp){
             console.log('createOrderActivity success');
        }, function(err){
             console.log('createOrderActivity error : ' + JSON.stringify(err));
        });
    };    
    var cancelSubmittedOrder = function(req, res){
        var orderId = req.params.id;
        var userId =  req.currentUser.id
        service.deleteOrder(orderId, userId).then(function(resp){
            return res.send(resp);
          }, function(err){
              return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
          });
        
    };
    var swapSubmittedOrder = function (req, res) {
        var accepterBankInfoData = req.query;
        var orderId = req.params.id;
        var userId = req.currentUser.id;
        var updatingOrderBankInfoData = {orderId: orderId};
        service.getOrderById(orderId).then(function (order) {
            if (order) {
                order = order.toJSON();
            }
            if (order.statusId != constant.STATUS_TYPE.SUBMITTED_ID) {
                return res.send({isError: true, message: 'Order was swapped by other user!'});
            }
            if (order.ownerId == userId) {
                return res.send({isError: true, message: 'Could not swap for the order that belong to you'});
            }

            // save new bank info of order
            if (!accepterBankInfoData.bankAccountName
                || !accepterBankInfoData.bankAccountNumber
                || !accepterBankInfoData.bankName
                || !accepterBankInfoData.bankCountry) {
                updatingOrderBankInfoData.accepterBankInfoId = accepterBankInfoData.choosenExistedBankInfoId;
                try {
                    orderValidation.validateOrderBankInfoObj(updatingOrderBankInfoData);
                } catch (err) {
                    return res.status(400).send(err);
                }
                bankService.saveOrderBankInfo(updatingOrderBankInfoData)
                    .then(function (resp) {
                        console.log('resp: ', resp);
                        return res.status(200).send({});
                    }, function (err) {
                        console.error(err);
                        return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                    })
            } else {
                accepterBankInfoData.memberId = userId;
                delete accepterBankInfoData.choosenExistedBankInfoId;
                try {
                    orderValidation.validateBankInfoObj(accepterBankInfoData);
                    orderValidation.validateOrderBankInfoObj(updatingOrderBankInfoData);
                } catch (err) {
                    return res.status(400).send(err);
                }
                bankService.createNewBankInfo(accepterBankInfoData)
                    .then(function (resp) {
                        updatingOrderBankInfoData.accepterBankInfoId = resp.id;
                        bankService.saveOrderBankInfo(updatingOrderBankInfoData)
                            .then(function (resp) {
                                return res.status(200).send({});
                            }, function (err) {
                                console.error(err);
                                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                            });
                    }, function (err) {
                        console.error(err);
                        return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                    });
            }

            service.swapOrder(orderId, userId).then(function (resp) {
                var msg = 'Order ' + order.code + ' has been received the swapping request from ' + (req.currentUser.fullName || req.currentUser.username);
                saveMessage('Swapping request', msg, userId, order.ownerId, order.code);
                createOrderActivity(orderId, userId, constant.STATUS_TYPE.SWAPPING_ID, 'Swapping request');
                return res.send(resp);
            }, function (err) {
                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            });
        }, function (err) {
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    };
    router.get('/genOrderCode', function (req, res) {
        res.send(generateCode(req.currentUser.id + req.currentUser.username));
    });
    router.post('/', function (req, res) {
        var clientOrderData = req.body;
        var newOrder = orderConverter.convertOrderData(clientOrderData);
        newOrder.ownerId = req.currentUser.id;
        newOrder.code = clientOrderData.code||generateCode(req.currentUser.id + req.currentUser.username);
        newOrder.statusId = constant.STATUS_TYPE.SUBMITTED_ID;
        service.saveOrder(newOrder).then(function (dataSave) {
            return res.status(200).send(dataSave);
        },function (err) {
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.put('/:code', function (req, res) {
        
        var code = req.params.code;
        var userId = req.currentUser.id;
        var clientOrderData = req.body;
        var newOrder = orderConverter.convertOrderData(clientOrderData);
        
        var orderUpdate = {};
        orderUpdate.rate = newOrder.rate;
        orderUpdate.give = newOrder.give;
        orderUpdate.get = newOrder.get;
        orderUpdate.giveCurrencyId = newOrder.giveCurrencyId;
        orderUpdate.getCurrencyId = newOrder.getCurrencyId;
        orderUpdate.updated = newOrder.updated;
        
        service.getOrderForEdit(code, userId, constant.STATUS_TYPE.SUBMITTED_ID).then(function(resp){
                if(!resp){
                        return res.send(resp);
                }
                
                //update expired
            var dayLive = clientOrderData.dayLive ? parseInt(clientOrderData.dayLive) : 3;
            var expired = new Date(resp.created);
            expired.setDate(expired.getDate() + dayLive);
            orderUpdate.expired = expired;
                service.updateOrderByCode(code, orderUpdate).then(function (dataSave) {
                return res.status(200).send({dataSave : dataSave});
            },function (err) {
                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            });
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.get('/', function (req, res) {
        service.getUserAllOrders(req.currentUser.id).then(function(resp){
            return res.send(resp);
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.get('/swapping', function (req, res) {
        service.getUserSwappingOrders(req.currentUser.id).then(function(resp){
            return res.send(resp);
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.get('/confirmed', function (req, res) {
        service.getUserConfirmedOrders(req.currentUser.id).then(function (resp) {
            //console.log(JSON.stringify(resp));
            return res.send(resp);
        }, function (err) {
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.get('/submitted', function (req, res) {
        service.getUserSubmittedOrders(req.currentUser.id).then(function(resp){
            return res.send(resp);
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    
    router.get('/swapping/cancel/:id', function (req, res) {
        return updateOrderStatus(req, res, constant.STATUS_TYPE.SUBMITTED_ID, constant.MSG.CANCEL_ORDER_CONTENT);
    });
    router.get('/swapping/confirm/:id', function (req, res) {
        return updateOrderStatus(req, res, constant.STATUS_TYPE.CONFIRMED_ID, constant.MSG.CONFIRM_ORDER_CONTENT);
    });

    router.get('/confirmed/cancel/:id', function (req, res) {
        return updateOrderStatus(req, res, constant.STATUS_TYPE.CANCELED_ID, constant.MSG.CANCEL_ORDER_CONTENT);
    });
    var countUserCleared = function(userId, orderId, statusId){
        var count = -1;
        service.getOrderActivity(orderId).then(function(activities){
                        if(activities){
                                for(var i = 0; i < activities.length; i++){
                                var activity = activities[i];
                                if(activity.statusId == statusId){
                                        count +=1;
                                }
                        }
                        }
        }, function(err){
                return count;
        });
        return count; 
    }
    router.get('/confirmed/clear/:id', function (req, res) {
        var orderId = req.params.id;
        service.getOrderById(orderId).then(function(order){
                if(order.statusId == constant.STATUS_TYPE.CONFIRMED_ID ){
                        return updateOrderStatus(req, res, constant.STATUS_TYPE.PENDING_ID, constant.MSG.PENDING_ORDER_CONTENT);
                } else {
                        return updateOrderStatus(req, res, constant.STATUS_TYPE.CLEARED_ID, constant.MSG.CLEAR_ORDER_CONTENT);
                }
        },function(err){
                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });

        
    });
    router.get('/submitted/cancel/:id', function (req, res) {
        return cancelSubmittedOrder(req, res);
    });
    router.get('/submitted/edit/:id', function (req, res) {
//        return updateOrderStatus(req, res, constant.STATUS_TYPE.CLEARED_ID, constant.MSG.CANCEL_ORDER_TITLE, constant.MSG.CANCEL_ORDER_MESSAGE);
    });
    router.get('/submitted/swap/:id', function (req, res) {
        return swapSubmittedOrder(req, res);
    });
    
    
    var getListResult = function(value, lessList, greatList){
        var listOutput = [];
        value = parseFloat(value);
        
        //console.log('getListResult value' + value);
        
        if(value <= 0){
                return listOutput;
        }
        var i = 0;
        var j = 0;
        var index = 0;
        while((i < lessList.length || j < greatList.length) && index < constant.SUGGETION_LIST_CONFIG.LIMIT_NUMBER){
                //console.log('getListResult index' + index);
                if(i == lessList.length){
                        listOutput.push(greatList[j]);
                        j++;
                }else if(j == greatList.length){
                        listOutput.push(lessList[i]);
                        i++;
                }else{
                        var itemGreat = greatList[j];
                        var itemLess = lessList[i];
                        
                        //console.log('getListResult get' + itemGreat.get + '-' + itemLess.get);
                        
                        var absGreat = itemGreat.get - value;
                        var absLess = value - itemLess.get;
                        
                        //console.log('getListResult ' + absGreat + '-' + absLess);
                        
                        if(absGreat <= absLess){
                                listOutput.push(itemGreat);
                                j++;
                        }else{
                                listOutput.push(itemLess);
                                i++;
                        }
                }
                index ++;
        }
        
        return listOutput;
    }
    router.get('/suggest', function (req, res) {
        var value = req.query.value;
        var giveCurrencyId = req.query.giveCurrencyId;
        var getCurrencyId = req.query.getCurrencyId;
        
        var list = [];
        
        var lessList = [];
        var greatList = [];
        service.getSuggestOrdersGreat(req.currentUser.id, value, giveCurrencyId, getCurrencyId).then(function(respGreat){
                //console.log('out out respGreat: ' + JSON.stringify(respGreat.length));
                if(respGreat){
                        greatList = respGreat;
                }
                service.getSuggestOrdersLess(req.currentUser.id, value, giveCurrencyId, getCurrencyId).then(function(respLess){
                        //console.log('out out respLess: ' + JSON.stringify(respLess.length));
                        if(respLess){
                                lessList = respLess;
                }
                        var output = getListResult(value,lessList, greatList);
                        //console.log('out out : ' + JSON.stringify(output.length));
                return res.send(output);
            }, function(err){
                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            });
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.get('/history', function (req, res) {
        service.getUserHistoryOrders(req.currentUser.id).then(function(resp){
          return res.send(resp);
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.get('/total', function (req, res) {
        service.getTotalOrderOfUser(req.currentUser.id).then(function(count){
          return res.send({count: count});
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
                
        });
    });
    
    router.get('/edit/:code', function (req, res) {
        var userId = req.currentUser.id;
        var code = req.params.code;
        service.getOrderForEdit(code, userId, constant.STATUS_TYPE.SUBMITTED_ID).then(function(resp){
                return res.send(resp);
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    
    router.get('/lastcreated', function (req, res) {
        var userId = req.currentUser.id;
        service.getLastOrderCreated(userId).then(function(resp){
                if(resp && resp.length > 0){
                        return res.send({isSuccessfull:true, order : resp[0]});
                }else{
                        return res.send({isSuccessfull:true, isNoData : true});
                }
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    
    router.get('/:code', function (req, res) {
        var userId = req.currentUser.id;
        var orderCode = req.params.code;
        var isCheckExpired = true;
        service.getOrderByCode(orderCode, userId, isCheckExpired).then(function(resp){
            console.log('bank info relation: ', resp);
                return res.send(resp);
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    return router;
};

