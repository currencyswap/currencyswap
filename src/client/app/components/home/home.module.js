'use-strict';

angular.module('homePage', ['ngRoute', 'ngCookies'])
    .component('homePage', {
        controller: ['$scope',
            '$rootScope',
            '$http',
            '$location',
            '$cookies', function ($scope, $rootScope, $http, $location, $cookies) {
        	
        	console.log('----Homepage----');
/*
                var userPermissions = $rootScope.permissions;
                var redirectTo = null;

                if (!userPermissions) return;

                if (permissions.VIEW_OWN_ORDERS in userPermissions) {
                    redirectTo = routes.ORDERS;
                } else if (permissions.USER_MANAGEMENT in userPermissions) {
                    redirectTo = routes.USERS;
                }

                if (redirectTo) {
                    var pattern = new UrlPattern(redirectTo);
                    $location.path(pattern.stringify());
                }
*/
            }]

    });
