'use strict';
/**
 * @author Viet Nghiem
 */
var redis = require('redis');
var sio = require('socket.io');
var sioRedis = require('socket.io-redis');

var config = require('../global-config');
var SocketConnection = require('./socket-connection');
var SocketMessage = require('../socket/socket-message');

module.exports = function(app) {
    var redisOption = config.redis;
    var io = new sio({'transports': [ 'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling' ]});
    io.attach(app.httpServer);
    io.adapter(sioRedis({ 'pubClient': redis.createClient(redisOption.port, redisOption.host, { return_buffers: true, auth_pass: redisOption.pass }), 'subClient': redis.createClient(redisOption.port, redisOption.host, { return_buffers: true, auth_pass: redisOption.pass }) }));
    io.sockets.on('connection', function (socket) {
       console.log('connection, socket id: ', socket.id);
       SocketConnection(io, socket);
       console.log('connected!');
    });
    // Attach socket to app
    app.SocketMessage = new SocketMessage(io);
    app.io = io;

    return io;
};