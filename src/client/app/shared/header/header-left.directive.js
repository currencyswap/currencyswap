'use strict';

function adjustmainpanelheight() {
    // Adjust mainpanel height
    var docHeight = jQuery(document).height();
    if (docHeight > jQuery('.mainpanel').height())
        jQuery('.mainpanel').height(docHeight);
}



angular.module('appHeader').directive('headerLeft', function () {
    return {
        restrict: 'EA',
        scope: {
            name: '@'
        },
        templateUrl: 'app/shared/header/header-left.template.html',
        controller: function ($rootScope, $cookies, $location, $scope, $element) {
            $scope.title = appConfig.title;
            $scope.currentPage = $rootScope.currentPage;
            $scope.menuItems = $rootScope.menuBar;

            if ($location.path() === routes.USERS) {
                $location.path(routes.USERS);
            }
            
            $scope.solidClazName = function(item) {
                return item.id.toLowerCase().replace(/[\s]+/, '-');
            };

            $rootScope.menuToggle = function () {
                var body = $('body');
                var bodypos = body.css('position');

                if (bodypos == 'relative') {
                    $rootScope.hasLeftMenuToggle = true;
                    if (body.hasClass('leftpanel-show'))
                        body.removeClass('leftpanel-show');
                    else
                        body.addClass('leftpanel-show');

                    adjustmainpanelheight();
                } else {
                    if (!body.hasClass('leftpanel-collapsed')) {
                        body.addClass('leftpanel-collapsed');
                        $('.nav-bracket ul').attr('style', '');
                        $(this).addClass('menu-collapsed');
                    } else {
                        body.removeClass('leftpanel-collapsed chat-view');
                        $('.nav-bracket li.active ul').css({ display: 'block' });
                        $(this).removeClass('menu-collapsed');
                    }
                }
            };
            $scope.accessMenuItem = function(item) {
                if ($('body').css('position') == 'relative') {
                    $rootScope.menuToggle();
                }
                $location.path(item.route);
            };
            // register menu toggle action
            $('.menutoggle').click($rootScope.menuToggle);
        }
    };
});
