'use strict';
/**
 * @author Viet Nghiem
 */
module.exports = function(io) {
    var send = function(room, eventPath, message) {
        io.to(room).emit(eventPath, message);
    };
    return {
       send: send,
       sendPong: function() {
           io.emit('/server/pong', {'message': 'server said: Hallo to you!'});
       },
       sendSupportUpdate: function(room, message) {
           send(room, '/server/supportUpdate', message);
       },
       sendUserExpired: function(userId, message) {
           send('support'+userId, '/server/userExpired', message);
       }
    }
};