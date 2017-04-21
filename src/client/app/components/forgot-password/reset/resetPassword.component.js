'use strict';

angular.module('resetPassword')
    .component('resetPassword', {
        templateUrl: 'app/components/forgot-password/reset/resetPassword.template.html',
        controller: ['$scope',
            '$rootScope',
            '$location',
            '$http',
            '$window',
            'CookieService',
            'GLOBAL_CONSTANT',
            function resetPassword($scope, $rootScope, $location, $http, $window, CookieService, GLOBAL_CONSTANT) {
                $scope.title = appConfig.title;
                $scope.newPwdFormData = {};

                $scope.isResetSuccess = false;

                $scope.backToLogin = function () {
                    $location.url(routes.LOGIN);
                };

                $scope.submitNewPassword = function () {

                    var headers = {};

                    headers[httpHeader.CONTENT_TYPE] = contentTypes.JSON;
                    var postData = {
                        newPassword: $scope.newPwdFormData.password,
                        resetCode: resetCode
                    };

                    var req = {
                        method: httpMethods.POST,
                        url: apiRoutes.API_FORGOT_PASSWORD_RESET,
                        headers: headers,
                        data: postData
                    };

                    return $http(req)
                        .then(function (response) {
                            if (response.status === GLOBAL_CONSTANT.HTTP_ERROR_STATUS_CODE) {
                                if (response.data.code === serverErrors.MEMBER_EMAIL_NOT_FOUND) {
                                    $rootScope.error = GLOBAL_CONSTANT.BAD_REQUEST_ERROR;
                                    return $location.url(routes.ERROR_PAGE);
                                }

                                if (response.data.code === serverErrors.COULD_NOT_UPDATE_USER_PWD) {
                                    $rootScope.error = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_ERROR;
                                    return $location.url(routes.ERROR_PAGE);
                                }
                            } else {
                                $scope.isResetSuccess = true;
                                $scope.resetPwdForm = false;
                            }
                        }, function (error) {
                            $rootScope.error = GLOBAL_CONSTANT.UNKNOWN_ERROR;
                            return $location.url(routes.ERROR_PAGE);
                        });
                };

                if ($location.search().resetCode) {
                    var resetCode = $location.search().resetCode;
                    var headers = {};

                    headers[httpHeader.CONTENT_TYPE] = contentTypes.JSON;

                    var req = {
                        method: httpMethods.GET,
                        url: apiRoutes.API_FORGOT_PASSWORD_RESET + '/' + '?resetCode=' + resetCode,
                        headers: headers
                    };

                    return $http(req)
                        .then(function (response) {
                            if (response.status === GLOBAL_CONSTANT.HTTP_ERROR_STATUS_CODE) {
                                if (response.data.code === serverErrors.RESET_PWD_CODE_NOT_FOUND
                                    || response.data.code === serverErrors.RESET_PWD_CODE_DOES_NOT_MATCH) {
                                    $rootScope.isLoading = false;
                                    $rootScope.error = GLOBAL_CONSTANT.RESET_CODE_EXPIRED_ERROR;
                                    return $location.url(routes.ERROR_PAGE);
                                }

                                if (response.data.code === serverErrors.COULD_NOT_DECRYPT_RESET_PWD_CODE) {
                                    $rootScope.isLoading = false;
                                    $rootScope.error = GLOBAL_CONSTANT.COULD_NOT_DECRYPT_RESET_PWD_CODE_ERROR;
                                    return $location.url(routes.ERROR_PAGE);
                                }
                            } else {
                                $scope.resetPwdForm = true;
                            }
                        }, function (error) {
                            $rootScope.error = GLOBAL_CONSTANT.UNKNOWN_ERROR;
                            return $location.url(routes.ERROR_PAGE);
                        });
                }
            }]
    });