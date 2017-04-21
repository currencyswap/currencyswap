'use strict';

angular.module('appHeader').directive('leftPanel', function () {
    return {
        restrict: 'EA',
        scope: {
            name: '@'
        },
        templateUrl: 'app/shared/header/left-panel.template.html',
        controller: function ($rootScope, $scope, $window, $location, $timeout, $element ,CookieService) {

            $scope.isAdmin = $rootScope.permissions.USER_MANAGEMENT;

            var _toggle = function() {
                if ($('body').css('position') == 'relative') {
                    $rootScope.menuToggle();
                }
            };
            var _isLeftPanelShow = function() {
                return body.hasClass('leftpanel-show');
            };
            
            var cookUser = CookieService.getCurrentUser();
            var avatarUrl = (cookUser.avatarUrl ? cookUser.avatarUrl : global.DEF_AVATAR);
            $scope.user = $.extend({'avatarUrl': avatarUrl, 'username': cookUser.username, 'fullName': ''}, $rootScope.user);

            $scope.randomNumImg = Math.round(Math.random()*10000000);
            $scope.title = appConfig.title;
            $scope.onLogout = function () {
                $rootScope.loggedIn = false;
                $rootScope.isLoading = true;
                CookieService.cleanUpCookies();
                $location.path(routes.LOGIN);
                $window.location.reload();
            };
            $scope.accessMenuItem = function(item) {
                _toggle();
                $location.path(item.route);
            };

            $.subscribe('/cs/user/update', function(user) {
                var avatarUrl = (cookUser.avatarUrl ? cookUser.avatarUrl : global.DEF_AVATAR);
                $timeout(function(){
                    $scope.user = $.extend({'avatarUrl': avatarUrl, 'username': '', 'fullName': ''}, $scope.user, user);
                    $scope.randomNumImg = Math.round(Math.random()*10000000);
                });
            });
        }
    };
});
