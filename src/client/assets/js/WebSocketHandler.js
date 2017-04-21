'use strict';
/**
 * @author Viet Nghiem
 */
(function($) {
        $.subscribeMessages = [
            {
            'topic': '/send/ping',
            'emit': '/server/ping',
            'logmsg':'Ping server'
            },
            {
            'topic': '/send/supportUpdate',
            'emit': '/server/supportUpdate',
            'logmsg':'new-support-message that need to be informed to server'
            }
        ];
        $.publishCommands = [
          {
            'cmd' : '/server/pong',
            'topic' : [ '/receive/pong' ],
            'logmsg' : 'Pong successful'
          },
          {
            'cmd' : '/server/supportUpdate',
            'topic' : [ '/receive/supportUpdate' ],
            'logmsg' : 'new-support-message that need to be informed to client'
          },
          {
              'cmd' : '/server/userExpired',
              'topic' : [ '/receive/userExpired' ],
              'logmsg' : 'User account gets expired'
            }
        ];
        $.WebSocketHandler = function(skParams) {
                var socket = null;
                var socketGlobal = {};
                var socketCmds = [ 'connect', 'disconnect', 'reconnecting', 'error', 'connecting', 'connect_failed', 'reconnect_failed', 'reconnect' ];

                var subscribeMap = {};

                $.startup = function() {
                        console.log('Web socket handler startup Start');

                        var host = skParams.host;
                        var skOptions = skParams.skOptions;

                        // clean up every thing if any
                        $.forceToDisconnectSK();

                        if (socket) {
                                console.log('Reconnect with existing WebSocket Manager');
                                if (skOptions) {
                                        socket.io.connect(host, skOptions);
                                } else {
                                        socket.io.connect(host);
                                }
                        } else {
                                console.log('Create a new WebSocket');
                                socket = (skOptions ? io(host, skOptions) : io(host));
                        }
                        
                        console.log('Start to register some socket basic events');
                        socket.on('connect', $.proxy(_onSocketConnect, socketGlobal, socket));
                        socket.on('disconnect', $.proxy(_onSocketDisconnected, socketGlobal, socket));
                        socket.on('reconnecting', $.proxy(_onSocketReconnecting, socketGlobal, socket));

                        socket.on('error', function(reason) {
                                console.warn('Unable to connect Socket.IO' + reason);
                        });
                        socket.on('connecting', function() {
                                console.log('Socket is connecting');
                        });
                        socket.on('connect_failed', function() {
                            console.warn('Socket fails to connect');
                            alert('Could not establish the socket connection due to network issue.');
                        });
                        socket.on('reconnect_failed', function() {
                                console.warn('Socket fails to re-connect');
                        });
                        socket.on('reconnect', function() {
                                console.warn('Socket trys to reconnect');
                        });
                        console.log('Web socket handler startup End');
                    };
                
                var _initConnect = function(socket) {
                        var options = skParams.cmdOptions;
                        for ( var i in options) {
                                socket.emit(i, options[i]);
                        }
                };

                var _onSocketConnect = function(socket) {
                        console.log('Socket is connected');
                        SocketListener(socket);
                        SocketSender(socket);

                        console.log('Execute some init actions on start');
                        _initConnect(socket);

                        console.log('Fire on socket connected');
                        $.publish('/wb/connect', []);
                };

                var _onSocketDisconnected = function(socket) {
                        console.log('Socket is disconnected');
                };

                var _onSocketReconnecting = function(socket, data) {
                        console.log('Socket is reconnecting', JSON.stringify(data));
                        console.log('Fire on socket reconnecting');
                        $.publish('/better/reconnecting', [ data ]);
                };

                var _cleanupSocketEvents = function() {
                        if (socket) {
                                for (var i = 0; i < socketCmds.length; i++) {
                                        try {
                                                socket.removeAllListeners(socketCmds[i]);
                                        } catch (e) {
                                        }
                                }
                        }
                };

                $.forceToDisconnectSK = function() {
                        console.log('forceToDisconnectSK');
                        if (socket) {
                                _cleanupAllSubscribes();
                                _cleanupAllListeners();
                                _cleanupSocketEvents();

                                socket.io.disconnect();
                        }
                };

                $.forceToReconnectSK = function() {
                        console.log('forceToReconnectSK');
                        if (socket) {
                                console.log('force to reconnect for anytime to start new connection');
                                socket.io.reconnect();
                        }
                };
                
                var _cleanupAllListeners = function() {
                        if (socket) {
                                var l = $.publishCommands;
                                var o = null;
                                for (var i = 0; i < l.length; i++) {
                                        o = l[i];
                                        if (o.cmd) {
                                                // remove all previous listeners for the topic
                                                try {
                                                    socket.removeAllListeners(o.cmd);
                                                } catch (e) {
                                                    console.warn('Error while removing previous listener of socket: '+ e);
                                                }
                                        }
                                }
                        }
                };
                
                var _cleanupAllSubscribes = function() {
                        var l = subscribeMap;
                        var fn = null;
                        for ( var t in l) {
                                fn = l[t];
                                if (fn) {
                                        $.unsubscribe(t);
                                        l[t] = null;
                                        fn = null;
                                }
                        }
                };
                
                var SocketSender = function(socket) {
                        console.log('Start subscribing of listeners of client sub/pub topics');

                        var subscribeCallback = function(socket, params, d) {
                                var p = params;

                                var emitTopic = p['emit'];
                                var logmsg = p['logmsg'] || null;
                                var data = d ? d : {}

                                //data['emit'] = emitTopic;

                                if (logmsg) {
                                        console.log(logmsg);
                                }

                                if (emitTopic != '') {
                                        if (!(socket.connected)) {// || socket.connecting
                                                console.log('Socket could not reach the server at this time.');
                                                $.publish('/better/alert', [ { message : 'Please check your device\'s network connection' } ]);

                                                socket.io.reconnect();
                                        }

                                        if (emitTopic === 'authen') {
                                                socket.emit(emitTopic, data);
                                                return;
                                        }

                                        if (emitTopic === 'logout') {
                                                socket.emit(emitTopic, data);
                                                return;
                                        }

                                        socket.emit(emitTopic, data);
                                }
                        };
                        var subscribe = function(socket, params) {
                                var topic = params['topic'];
                                subscribeMap[topic] = $.subscribe(topic, $.proxy(subscribeCallback, socketGlobal, socket, params));
                        };
                        
                        // doing subscribe for all items
                        console.log('subscribing ...');
                        _cleanupAllSubscribes();

                        var l = $.subscribeMessages;
                        var o = null;
                        for (var i = 0; i < l.length; i++) {
                                o = l[i];
                                if (o.topic) {
                                        subscribe(socket, o);
                                }
                        }
                };
                
                var SocketListener = function(socket) {
                        console.log('Start subscribing the listeners of websocket');

                        var socketCallback = function(socket, params, data) {
                                console.log('socketCallback: Fire from Server side. Init params: ' + JSON.stringify(params));
                                var p = params;

                                var logmsg = p['logmsg'];
                                var topics = p['topic'] || null;
                                var errTopic = p['errTopic'] || null;
                                var emit = p['emit'] || null;

                                // validate/init parameters
                                emit = emit ? emit : null;

                                if (logmsg) {
                                        console.log(logmsg, data);
                                }

                                if (topics) {
                                        for ( var t in topics) {
                                                console.log('publishing to topic' + topics[t]);
                                                $.publish(topics[t], [ data ]);
                                        }
                                }
                                
                                if (data && data.err && errTopic) {
                                        console.log('publishing to error topic', errTopic);
                                }
                                
                                if (data && emit) {
                                        console.log('emit', emit);
                                        socket.emit(emit, data);
                                }
                        };
                        
                        var listener = function(socket, params) {
                                var p = params;
                                var cmd = p['cmd'];

                                // register the new listener (addListener)
                                socket.on(cmd, $.proxy(socketCallback, socketGlobal, socket, p));
                        };
                        
                        console.log('Listening messages...');
                        _cleanupAllListeners();

                        var l = $.publishCommands;
                        var o = null;
                        for (var i = 0; i < l.length; i++) {
                                o = l[i];
                                if (o.cmd) {
                                        listener(socket, o);
                                }
                        }
                };
                // doing thing
                $.startup();
        };
})(jQuery);
