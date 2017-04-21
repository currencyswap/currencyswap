'use strict';

angular.module('errorPage').directive('errorPage', ['GLOBAL_CONSTANT', '$window', '$location', function (GLOBAL_CONSTANT, $window, $location) {
    return {
        restrict: 'EA',
        scope: {
            name: '@',
        },
        templateUrl: 'app/shared/error-page/error-page.template.html',
        controller: function ($rootScope, $scope, $element) {
            $scope.error = $rootScope.error;

            console.log('ERROR: ', $scope.error);

            if ($scope.error.name === GLOBAL_CONSTANT.UNKNOWN_ERROR.name
                || $scope.error.name === GLOBAL_CONSTANT.NOT_FOUND.name) {

                $scope.isError = true;
            }

            if ($scope.error.name === GLOBAL_CONSTANT.ACTIVE_CODE_EXPIRED_ERROR.name) {
                $scope.isExpiredActiveLink = true;
            }

            if ($scope.error.name === GLOBAL_CONSTANT.RESET_CODE_EXPIRED_ERROR.name) {

            }

            $scope.activeLinkExpiredError = $scope.error.name === GLOBAL_CONSTANT.ACTIVE_CODE_EXPIRED_ERROR.name;

            $window.scrollTo(0, 0);

            $scope.backToRegister = function () {
                $location.path(routes.REGISTER);
            };

            $scope.backToLogin = function () {
                $location.path(routes.LOGIN);
                $window.location.reload();
            };
        }
    };
}]);


/*angular.module('errorPage')
    .component('errorPage', {
        templateUrl: 'app/shared/error-page/error-page.template.html',
        controller: [
            '$rootScope',
            '$scope',
            'GLOBAL_CONSTANT',
            '$window',
            '$location',
            function errorPageController($rootScope, $scope, GLOBAL_CONSTANT, $window, $location) {
                $scope.error = $rootScope.error;

                if ($scope.error.name === GLOBAL_CONSTANT.UNKNOWN_ERROR.name
                    || $scope.error.name === GLOBAL_CONSTANT.NOT_FOUND.name) {
                    $scope.isError = true;
                }

                if ($scope.error.name === GLOBAL_CONSTANT.ACTIVE_CODE_EXPIRED_ERROR.name) {
                    $scope.isExpiredActiveLink = true;
                }

                $scope.activeLinkExpiredError = $scope.error.name === GLOBAL_CONSTANT.ACTIVE_CODE_EXPIRED_ERROR.name;

                $window.scrollTo(0, 0);

                $scope.backToRegister = function () {
                    $location.url($location.url());
                    $window.location.reload();
                };

                $scope.backToLogin = function () {
                    $location.path($location.url());
                    $window.location.reload();
                };
        }]
    });*/
