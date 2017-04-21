'use strict';

angular.module('help')
    .component('help', {
        templateUrl: 'app/components/help/help.template.html',
        controller: ['$scope',
            '$rootScope',
            '$timeout',
            'CookieService',
            'PermissionService',
            'NavigationHelper',
            'GLOBAL_CONSTANT',
            function helpController($scope, $rootScope, $timeout, CookieService, PermissionService, NavigationHelper, GLOBAL_CONSTANT) {
            }]
    });
