'use strict';
/**
 * @author Viet Nghiem
 */
angular.module('support')
    .component('support', {
        templateUrl: 'app/components/support/support.template.html',
        controller: ['$scope',
            '$rootScope',
            '$timeout',
            'SupportService',
            'PermissionService',
            'NavigationHelper',
            'GLOBAL_CONSTANT',
            function supportController($scope, $rootScope, $timeout, SupportService, PermissionService, NavigationHelper, GLOBAL_CONSTANT) {
                var _checkAdmin = function() {
                    var user = $rootScope.user;
                    if (user && user.groups && user.groups.length > 0) {
                        for (var i=0; i<user.groups.length; i++) {
                            var group = user.groups[i];
                            if (group.name === 'Admin') {
                                $scope.messageTitle = 'Message to Users';
                                $scope.support.groupName = 'User';
                                break;
                            }
                        }
                        $scope.support.creatorId = user.id;
                    }
                };
                
                $scope.messageTitle = 'Message to Admin';
                $scope.support = {'title': '', 'message': '', 'groupName': 'Admin'};
                $scope.init = function() {
                    $('[data-toggle="popover"]').popover();
                    _checkAdmin();
                };
                $scope.save = function() {
                    console.log('save')
                    $scope.message = '';
                    SupportService.saveSupport($scope.support).then(function(resp){
                        console.log('Successful in saving message');
                        $timeout(function(){
                            $scope.message = 'Successful: Your message has been sent';
                            $scope.support.title = '';
                            $scope.support.message = '';
                        });
                    }, function(err){
                        console.log('Failure in saving your message');
                        $timeout(function(){
                            $scope.message = 'Failure: Could not send your message due to system error. Please try again later!';
                        });
                    });
                };
                
                $scope.resetMessage = function() {
                    $scope.message = '';
                };

                // init
                $scope.init();
            }]
    });
