'use strict';
/**
 * @author Viet Nghiem
 */
var errorUtil = require('../libs/errors/error-util');
var errors = require('../libs/errors/errors');
var dbUtil = require('../libs/utilities/db-util');
var app = require('../server');

var MAX_QUICK_NUM = 5;

var bankInfoRelation = {
    'relation': 'bankInfo'
};

var creatorRelation = {
        'relation' : 'creator',
        'scope' : {
            'fields' : [ 'id', 'username', 'email', 'fullName' ]
        }
      };
var groupRelation = {
        'relation' : 'groups',
        'scope' : {
            'fields' : [ 'id', 'name' ]
        }
      };
exports.getCreator = function(username) {
    return dbUtil.executeModelFn(app.models.Member, 'findOne', {'where': {"username": username}, 'include': [groupRelation]});
};
exports.getCreatorById = function(id) {
    return dbUtil.executeModelFn(app.models.Member, 'findOne', {'where': {"id": id}, 'include': [groupRelation, bankInfoRelation]});
};

exports.getGroups = function() {
    return dbUtil.executeModelFn(app.models.Group, 'find', {});
};

exports.saveMessage = function(input) {
    var dto = {
            title: input.title,
            message: input.message,
            created: new Date(),
            isGroupMessage: input.isGroupMessage,
            creatorId: input.creatorId,
            receiverId: input.receiverId,
            orderCode: input.orderCode
    };

    if (!dto.isGroupMessage && dto.receiverId) {
        app.SocketMessage.sendSupportUpdate('support'+dto.receiverId, {'message': 'You have a new support message'});
    }

    return dbUtil.executeModelFn(app.models.Message, 'create', dto);
};

exports.messageToGroup = function(input) {
    return exports.getGroups().then(function(groups){
        // get the group receiver
        for (var i=0; i<groups.length; i++) {
            if (groups[i].name === input.groupName) {
                input.receiverId = groups[i].id;
                break;
            }
        }
        if (!input.receiverId) {
            return {'message': 'Could not save message due to system is laking of groups setting'};
        }

        app.SocketMessage.sendSupportUpdate(input.groupName, {'message': 'You have a new support message'});

        input.isGroupMessage = true;
        delete input.groupName;
        return exports.saveMessage(input);
    }, function(){
        return {'message': 'Could not save message due to system issue'};
    });
};

exports.getMessages = function(userId, groups, limit, skip, lastId) {
    var readersRelation = {
            'relation' : 'reads',
            'scope' : {
                'where' : {'readerId': userId},
                'fields' : [ 'readerId', 'created' ]
            }
    };
    var orderBy = 'id DESC';
    var lastOne = null;
    if (lastId == parseInt(lastId) && lastId > 0) {
        lastOne = {'id': {'lt': lastId}};
    }
    var condSingle = {and : [{'isGroupMessage': false}, {'receiverId': userId}]};
    if (lastOne) {
        condSingle.and.push(lastOne);
    }
    var condGroup = null;
    var isGroup = (groups && groups.length > 0);
    if (isGroup) {
        var orConds = [];
        orConds.push(condSingle);
        for (var i=0; i<groups.length; i++) {
            var cond = {and : [{'isGroupMessage': true}, {'receiverId': groups[i].id}]};
            if (lastOne) {
                cond.and.push(lastOne);
            }
            orConds.push(cond);
        }
        condGroup = { or : orConds };
    }
    var filter = {'include': [creatorRelation, readersRelation], 'order': orderBy, 'where': (isGroup ? condGroup : condSingle)};
    if (limit == parseInt(limit) && limit > 0) {
        filter['limit'] = limit;
    }
    if (skip == parseInt(skip) && skip >= 0) {
        filter['skip'] = skip;
    }
    return dbUtil.executeModelFn(app.models.Message, 'find', filter);
};
exports.countUnreadMessages = function(userId, groups) {
    var sql = 'SELECT M.id FROM Message M WHERE ';
    var condition = '(M.isGroupMessage = 0 AND M.receiverId = '+ userId +')';

    if (groups && groups.length > 0) {
        var orConds = condition;
        for (var i=0; i<groups.length; i++) {
            orConds += ' OR (M.isGroupMessage = 1 AND M.receiverId = '+ groups[i].id +')';
        }
        condition = '('+ orConds +')';
    }
    sql += condition;
    sql = 'SELECT COUNT(id) as num FROM ('+ sql +') as F WHERE id NOT IN (SELECT messageId FROM MessageRead X WHERE X.readerId = ' + userId + ')';
    //console.log('sql......', sql);
    return dbUtil.executeSQL(app.models.Message, sql, []);
};

exports.markReadMessage = function(messageId, readerId) {
    var dto = {
            messageId: messageId,
            readerId: readerId,
            created: new Date()
    };
    var condition = { 'where': {
            and : [{'readerId': readerId}, {'messageId': messageId}]
        }
    };
    return dbUtil.executeModelFn(app.models.MessageRead, 'findOrCreate', condition, dto);
};
exports.existMessage = function(receiverId, title, message) {
    var filter = {'where': {
        and : [{'receiverId': receiverId}, {'title': title}, {'message': message}]
    }};
    return dbUtil.executeModelFn(app.models.Message, 'findOne', filter);
};