'use-strict';

angular.module('register', ['ngRoute', 'cookieManager', 'permission', 'navigation', 'angularCountryState', 'base64'])
    .directive('ngMatch', ['$parse', function ($parse) {
        var directive = {
            link: link,
            restrict: 'A',
            require: '?ngModel'
        };
        return directive;

        function link(scope, elem, attrs, ctrl) {
            if (!ctrl) return;
            if (!attrs['ngMatch']) return;

            var firstPassword = $parse(attrs['ngMatch']);

            var validator = function (value) {
                var temp = firstPassword(scope),
                    v = value === temp;
                ctrl.$setValidity('match', v);
                return value;
            };

            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.push(validator);
            attrs.$observe('ngMatch', function () {
                validator(ctrl.$viewValue);
            });
        }
    }])
    .directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
        return {
            link: function (scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function (value) {
                    if (value === true) {
                        $timeout(function () {
                            element[0].focus();
                        });
                    }
                });
                element.bind('blur', function () {
                    scope.$apply(model.assign(scope, false));
                });
            }
        };
    }]);