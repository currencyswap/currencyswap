'use strict';

var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var app = require('../server');
var Q = require('q');
var dbUtil = require('../libs/utilities/db-util');
var constant = require('../libs/constants/constants');

var ownerRelation = {
        'relation' : 'owner',
        'scope' : {
            'fields' : [ 'id', 'username', 'email', 'fullName' ],
        }
};
var accepterRelation = {
        'relation' : 'accepter',
        'scope' : {
            'fields' : [ 'id', 'username', 'email', 'fullName' ],
        }
};

var giveCurrencyRelation = {
        'relation' : 'giveCurrency'
};
var getCurrencyRelation = {
        'relation' :'getCurrency'
}

var statusRelation = {
        'relation' : 'status'
};
var creatorRelation = {
        'relation' : 'creator'
};
var activitiesRelation = {
                'relation' : 'activities',
                'scope' : {
                        'include' : [creatorRelation]
                }
};

var orderBankInfoRelation = {
    'relation' : 'bankInfoOfOrder'
};

var initializerBankInfo = {
    'relation' : 'initializerBankInfo'
};

var accepterBankInfo = {
    'relation' : 'accepterBankInfo'
}

exports.filterOrders = function (filter) {
    return dbUtil.executeModelFn(app.models.Order, 'find', filter);
};

exports.getOrderById = function (id) {
    var filter = {
            'where': { 'id': id },
            'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, orderBankInfoRelation, initializerBankInfo, accepterBankInfo]
    };
    return dbUtil.executeModelFn(app.models.Order, 'findOne', filter);
};
exports.getOrderByCode = function (orderCode, userId, isCheckExpired) {
    var filter = {
            'where': { and : [{'code': orderCode}]},
            'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation, activitiesRelation, orderBankInfoRelation, initializerBankInfo, accepterBankInfo]
    };
    if(userId){
    	filter.where.and.push({or : [{'ownerId' : userId}, {'accepterId' : userId}]});
    }
    if(isCheckExpired){
    	var statusExpiredId = constant.STATUS_TYPE.EXPIRED_ID;
    	filter.where.and.push({'statusId' : {'neq': statusExpiredId}});
    }
    return dbUtil.executeModelFn(app.models.Order, 'findOne', filter);
};

exports.getLastOrderCreated = function (userId) {
    var filter = {
            'where': { and : [{'ownerId': userId}]},
            'order': 'created DESC',
            'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation, activitiesRelation]
    };
    return dbUtil.executeModelFn(app.models.Order, 'find', filter);
};

exports.getOrderForEdit = function (orderCode, userId, statusId) {
    var filter = {
            'where': { and : [{'code': orderCode} , {'ownerId' : userId}, {'statusId' : statusId}]},
            'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation, activitiesRelation]
    };
    return dbUtil.executeModelFn(app.models.Order, 'findOne', filter);
};
exports.updateOrder = function (where, obj) {
    obj.updated = new Date();
    return dbUtil.executeModelFn(app.models.Order, 'updateAll', where, obj);
};

exports.saveOrder = function (newOrder) {
        return dbUtil.executeModelFn(app.models.Order, 'create', newOrder);
};
exports.updateOrderByCode = function (code, updateOrder) {
    var where = { 'code': code };
    updateOrder.updated = new Date();
    return dbUtil.executeModelFn(app.models.Order, 'updateAll', where, updateOrder);
};
exports.updateOrderStatus = function (orderId, statusId, userId, isResetAccepter) {
    var order = { 'statusId': statusId, 'updated': new Date() };
    if(statusId == constant.STATUS_TYPE.SUBMITTED_ID){
    	order.accepterId = 0;
    }
    var where = { 'and': [{ 'id': orderId }, {'statusId': {'neq': statusId}}, {or: [{'accepterId' : userId}, {'ownerId': userId}]}] };
    // reset item
//    if(statusId == constant.STATUS_TYPE.SUBMITTED_ID){
//        order.accepterId = 0;
//    }
    return dbUtil.executeModelFn(app.models.Order, 'updateAll', where, order);
};
exports.swapOrder = function(orderId, accepterId){
    var time = new Date();
    var order = { 'statusId': constant.STATUS_TYPE.SWAPPING_ID , 'accepterId' : accepterId, 'updated': time};
    var where = { 'and': [{ 'id': orderId }, {'statusId': constant.STATUS_TYPE.SUBMITTED_ID}, {'ownerId': {'neq': accepterId}}, {'expired': {'gt': time}}] };
    return dbUtil.executeModelFn(app.models.Order, 'updateAll', where, order);
}
exports.getUserSwappingOrders = function (userId) {
    var filter = {
            'where': {
            and: [{ or: [{'ownerId': userId}, 
                         {'accepterId': userId}] 
                            },
                  { statusId: constant.STATUS_TYPE.SWAPPING_ID }
            ]
    },
    'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation, activitiesRelation],
    'order': 'id DESC'
    };
    return dbUtil.executeModelFn(app.models.Order, 'find', filter);
};
exports.getUserConfirmedOrders = function (userId) {
        var activitiesRelation = {
            'relation' : 'activities',
            'scope' : {
                    'fields' : [ 'creatorId', 'orderId', 'statusId'],
                    'include' : [
                                 	{
                                 		'relation' : 'creator',
                                 		'scope' : {
                                 			'fields' : [ 'username']
                                 		}
                                 	}
                                ],
                     'order': 'created DESC'
            }
        };
        activitiesRelation.scope['where'] =  {'creatorId': userId}
    var filter = {
                        'where': {
                        and: [
                              { or: [{'ownerId': userId}, {'accepterId': userId}]},
                              {or : [ {'statusId': constant.STATUS_TYPE.CONFIRMED_ID}, { 'statusId': constant.STATUS_TYPE.PENDING_ID} ]}
                        ]
                        },
                        'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation, activitiesRelation],
                        'order': 'id DESC'
    };
    return dbUtil.executeModelFn(app.models.Order, 'find', filter);
};

exports.getUserSubmittedOrders = function (userId) {
    var filter = {
            'where': {
            and: [{'ownerId': userId}, 
                  { statusId: constant.STATUS_TYPE.SUBMITTED_ID }
            ]
    },
    'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation, activitiesRelation],
    'order': 'id DESC'
    };
    return dbUtil.executeModelFn(app.models.Order, 'find', filter);
};
exports.getUserHistoryOrders = function (userId) {
    var filter = {
            'where': {
            and: [{ or: [{'ownerId': userId}, 
                         {'accepterId': userId}] 
                            },
                  {or : [ {'statusId': constant.STATUS_TYPE.CLEARED_ID}, { 'statusId': constant.STATUS_TYPE.CANCELED_ID} ]}
            ]
    },
    'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation],
    'order': 'id DESC'
    };
    return dbUtil.executeModelFn(app.models.Order, 'find', filter);
};
exports.getSuggestOrdersGreat = function (userId, value, giveCurrencyId, getCurrencyId) {
        var deferred = Q.defer()
        
    var max = value * (1 + constant.SUGGETION_LIST_CONFIG.ROTATE_SUGGETION);
    
    var filterGreat = {
        'limit' : constant.SUGGETION_LIST_CONFIG.LIMIT_NUMBER,
        'order' : "get ASC",
        'where': {
                and: [
                      {'ownerId': {'neq': userId}},
                      { 'statusId': constant.STATUS_TYPE.SUBMITTED_ID },
                      {'get' : {'lte' : max}},
                      {'get' : {'gt' : value}},
                      {'giveCurrencyId' : getCurrencyId},
                      {'getCurrencyId' : giveCurrencyId}
                ]
        },
        'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation, activitiesRelation]
    };
    
    dbUtil.executeModelFn(app.models.Order, 'find', filterGreat).then(function(dataGreat){
        deferred.resolve(dataGreat);
    }, function(err){
        deferred.reject(err);
    });
    
    return deferred.promise;
};

exports.getSuggestOrdersLess = function (userId, value, giveCurrencyId, getCurrencyId) {
        var deferred = Q.defer()
        
    var min = value * (1 - constant.SUGGETION_LIST_CONFIG.ROTATE_SUGGETION);
    
    var filterLess = {
        'limit' : constant.SUGGETION_LIST_CONFIG.LIMIT_NUMBER,
        'order' : "get DESC",
        'where': {
                and: [
                      {'ownerId': {'neq': userId}},
                      { 'statusId': constant.STATUS_TYPE.SUBMITTED_ID },
                      {'get' : {'gte' : min}},
                      {'get' : {'lte' : value}},
                      {'giveCurrencyId' : getCurrencyId},
                      {'getCurrencyId' : giveCurrencyId}
                ]
        },
        'include' : [ ownerRelation, accepterRelation, giveCurrencyRelation, getCurrencyRelation, statusRelation, activitiesRelation]
    };
    
        dbUtil.executeModelFn(app.models.Order, 'find', filterLess).then(function(dataLess){
        deferred.resolve(dataLess);
    }, function(err){
        deferred.reject(err);
    });
    
    return deferred.promise;
};

exports.getExpiredOrders = function (time, limitTime) {
    var filter = {
            'where': {
            and: [
                  {'expired': {'lt': time}},
                  { 'statusId': constant.STATUS_TYPE.SUBMITTED_ID }
            ]
    },
    'include' : [ ownerRelation, giveCurrencyRelation, getCurrencyRelation],
    'order': 'id ASC'
    };
    if (limitTime) {
        filter.where.and.push({'expired': {'gt': limitTime}});
    }
    return dbUtil.executeModelFn(app.models.Order, 'find', filter);
};
exports.setOrderExpired = function (orderId, time) {
    var order = { 'statusId': constant.STATUS_TYPE.EXPIRED_ID, 'updated': new Date() };
    var where = { 'and': [{ 'id': orderId }, {'statusId': constant.STATUS_TYPE.SUBMITTED_ID}, {'expired': {'lt': time}}] };
    return dbUtil.executeModelFn(app.models.Order, 'updateAll', where, order);
};

exports.deleteOrder = function(orderId, userId) {
    var where = {and : [{ 'id': orderId },
                        {'ownerId': userId}]};
    return dbUtil.executeModelFn(app.models.Order, 'destroyAll', where);
};
exports.updateOrderActivity = function (orderId, creatorId, statusId) {
        var where = {and: [{'orderId' : orderId},
                           {'creatorId': creatorId}
                                        ]};
    return dbUtil.executeModelFn(app.models.OrderActivity, 'updateAll', where, {'statusId': statusId, 'updated':  new Date()});
};
exports.createOrderActivity = function (orderId, creatorId, statusId, description) {
        var newItem = {'orderId' : orderId,'creatorId': creatorId, 'statusId': statusId, 'description': description};
    return dbUtil.executeModelFn(app.models.OrderActivity, 'create', newItem);
};
exports.getOrderActivity = function (orderId) {
    var filter = {
            'where': {
                'orderId': orderId,
            },
            'order': 'id ASC'
    };
    return dbUtil.executeModelFn(app.models.OrderActivity, 'find', filter);
};
exports.getPartnerOrderOfUser = function(orderId, userId){
    var filter = {
                'where' : {
                        and : [ 
                               {'orderId' : orderId}, 
                               {'creatorId' : {'neq' : userId}} 
                           ]
                }
    };
    return dbUtil.executeModelFn(app.models.OrderActivity, 'find', filter);

};
exports.getUserAllOrders = function (userId) {
    var filter = {
                'where': { or: [{'ownerId': userId}, 
                            {'accepterId': userId}] 
            },
            'order': 'id DESC'
    };
    return dbUtil.executeModelFn(app.models.Order, 'find', filter);
};
exports.getTotalOrderOfUser = function(userId){
                var where = { and: [{or: [{'ownerId': userId}, {'accepterId': userId}]}, 
                                    {'statusId': {'neq': constant.STATUS_TYPE.EXPIRED_ID}}], 
            };
        
    return dbUtil.executeModelFn(app.models.Order, 'count', where);
};

exports.removeOrderActivity = function (orderId) {
    var where = { 'orderId': orderId };
    return dbUtil.executeModelFn(app.models.OrderActivity, 'destroyAll', where);
};

exports.removeOrderBankInfo = function (orderId) {
    var where = { 'orderId': orderId };
    return dbUtil.executeModelFn(app.models.OrderBankInfo, 'destroyAll', where);
};
