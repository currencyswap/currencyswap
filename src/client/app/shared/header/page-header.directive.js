'use strict';

angular.module('appHeader').directive('pageHeader', function () {
    return {
        restrict: 'EA',
        scope: {
            name: '@'
        },
        templateUrl: 'app/shared/header/page-header.template.html',
        controller: function ($scope, $rootScope, $element) {
            $scope.title = appConfig.title;
            $scope.currentPage = $rootScope.currentPage;
            $.detectDevice();
            $.buildCSLeftPanelMenu();
        }
    };
});
