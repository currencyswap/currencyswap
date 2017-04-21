'use strict';
/**
 * @author Viet Nghiem
 */
var errors = require('../libs/errors/errors');
var errorUtil = require('../libs/errors/error-util');
var service = require('../services/support-service');

module.exports = function (app) {
    var router = app.loopback.Router();

    router.get('/creator', function (req, res, next) {
        //console.log('req.currentUser', req.currentUser);
        service.getCreatorById(req.currentUser.id).then(function(resp){
            return res.send(resp);
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.get('/', function (req, res, next) {
        var limit = req.query.limit;
        var skip = req.query.skip;
        var isUnreadCount = req.query.isUnreadCount;
        var lastId = req.query.lastId;
        service.getCreatorById(req.currentUser.id).then(function(user){
            var groups = null;
            if (user) {
                user = user.toJSON();
                groups = user.groups;
            }
            service.getMessages(req.currentUser.id, groups, limit, skip, lastId).then(function(messages){
                if (isUnreadCount) {
                    service.countUnreadMessages(req.currentUser.id, groups).then(function(counter){
                        var num = counter[0].num;
                        return res.send({'isSuccessful': true, 'messages': messages, 'unreads': num});
                    }, function(e){
                        return res.send({'isSuccessful': true, 'messages': messages, 'unreads': 0});
                    });
                } else {
                    return res.send({'isSuccessful': true, 'messages': messages});
                }
            }, function(e){
                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            });
        }, function(err){
            return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
        });
    });
    router.post('/', function (req, res, next) {
        var input = req.body;
        if (req.currentUser && req.currentUser.id != input.creatorId) {
            return res.status(404).send(errorUtil.createAppError(errors.INVALID_PARAMETER_INPUT));
        }

        if (input.groupName) {
            service.messageToGroup(input).then(function(message){
                if (!message || !message.id) {
                    return res.status(500).send(errorUtil.createAppError(message||errors.SERVER_GET_PROBLEM));
                }
                return res.send({'isSuccessful': true});
            }, function(message){
                return res.status(500).send(errorUtil.createAppError(message||errors.SERVER_GET_PROBLEM));
            });
        } else {
            if (!input.receiverId) {
                return res.status(404).send(errorUtil.createAppError(errors.INVALID_PARAMETER_INPUT));
            }
            service.saveMessage(input).then(function(resp){
                return res.send({'isSuccessful': true});
            }, function(e){
                return res.status(500).send(errorUtil.createAppError(errors.SERVER_GET_PROBLEM));
            });
        }
    });
    
    router.post('/markRead', function (req, res, next) {
        var messageId = req.body.messageId;
        if (messageId != parseInt(messageId) || messageId <= 0) {
            return res.status(404).send(errorUtil.createAppError(errors.INVALID_PARAMETER_INPUT));
        }
        service.markReadMessage(messageId, req.currentUser.id).then(function(message){
            return res.send({'isSuccessful': true});
        }, function(message){
            return res.status(500).send(errorUtil.createAppError(message||errors.SERVER_GET_PROBLEM));
        });
    })

    return router;
};
