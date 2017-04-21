'use strict';

angular.module('appFooter').directive('footer', function () {
    return {
        restrict: 'EA',
        scope: {
            name: '@'
        },
        templateUrl: 'app/shared/footer/footer.template.html',
        controller: function ($scope, $rootScope, $element, $sce ) {
            $scope.footer = $sce.trustAsHtml( appConfig.footer );
        }
    };
});
