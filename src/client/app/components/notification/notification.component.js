'use strict';
/**
 * @author Viet Nghiem
 */
angular.module('notification')
    .component('notification', {
        templateUrl: 'app/components/notification/notification.template.html',
        controller: ['$scope',
            '$rootScope',
            '$timeout',
            '$location',
            'CookieService',
            'NotiService',
            'PermissionService',
            'NavigationHelper',
            'GLOBAL_CONSTANT',
            function notiController($scope, $rootScope, $timeout, $location, CookieService, NotiService, PermissionService, NavigationHelper, GLOBAL_CONSTANT) {
                $scope.messages = [];
                $scope.hasMore = false;
                $scope.allLoaded = false;
                var LIMIT_ITEMS = 25;

                $scope.init = function() {
                    NotiService.getMessages(LIMIT_ITEMS).then(function(resp){
                        if (!resp.messages || resp.messages.length === 0) {
                            return;
                        }
                        $timeout(function(){
                            $scope.messages = resp.messages;
                            if (resp.messages.length === LIMIT_ITEMS) {
                                $scope.hasMore = true;
                                $scope.allLoaded = false;
                            }
                        });
                    });
                };
                
                $scope.loadMore = function() {
                    var lastId = 0;
                    if ($scope.messages.length > 0) {
                        lastId = $scope.messages[$scope.messages.length-1].id;
                    }
                    NotiService.getMessages(LIMIT_ITEMS, lastId).then(function(resp){
                        if (!resp.messages || resp.messages.length === 0) {
                            $timeout(function(){
                                $scope.hasMore = false;
                                $scope.allLoaded = true;
                            });
                            return;
                        }
                        var messages = $scope.messages.concat(resp.messages);
                        $timeout(function(){
                            $scope.messages = messages;
                            if (resp.messages.length === LIMIT_ITEMS) {
                                $scope.hasMore = true;
                                $scope.allLoaded = false;
                            } else {
                                $scope.hasMore = false;
                                $scope.allLoaded = true;
                            }
                        });
                    });
                };

                $scope.readMessage = function (msg) {
                    $.publish('/cs/read/notiMessage', [{'id': msg.id, 'isRead': msg.reads.length}]);
                    if (msg.reads.length === 0) {
                        NotiService.markRead(msg.id);
                        msg.reads.push({'created': new Date()});
                    }

                    $rootScope.openMessageModel(msg);
                };

                  $.subscribe('/cs/read/headMessage', function(msg) {
                      for (var i=0; i<$scope.messages.length; i++) {
                          if ($scope.messages[i].id === msg.id) {
                              if ($scope.messages[i].reads.length === 0)
                              $timeout(function(){
                                  $scope.messages[i].reads.push({'created': new Date()});
                              });
                              break;
                          }
                      }
                  });
                  $.subscribe('/receive/supportUpdate', function(data) {
                      NotiService.getMessages(LIMIT_ITEMS).then(function(resp){
                          if (!resp.messages || resp.messages.length === 0) {
                              return;
                          }
                          var len = Math.min(LIMIT_ITEMS, $scope.messages.length);
                          var messages = [];
                          if (len === 0) {
                              $timeout(function(){
                                  $scope.messages = resp.messages;
                              });
                          } else {
                              for (var i=0; i<resp.messages.length; i++) {
                                  var notFound = true;
                                  for (var j=0; j<len; j++) {
                                      if (resp.messages[i].id === $scope.messages[j].id) {
                                          notFound = false;
                                          break;
                                      }
                                  }
                                  if (notFound) {
                                      messages.push(resp.messages[i]);
                                  }
                              }
                          }
                          if (messages.length > 0) {
                              $timeout(function(){
                                  $scope.messages = messages.concat($scope.messages);
                              });
                          }
                      });
                  });
                $scope.init();
            }]
    });
