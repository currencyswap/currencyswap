'use strict';

angular.module('verifyInfo')
    .component('verifyInfo', {
        templateUrl: 'app/components/forgot-password/verify/verifyInfo.template.html',
        controller: ['$scope',
            '$rootScope',
            '$location',
            '$http',
            '$window',
            'GLOBAL_CONSTANT',
            function verifyInfoController($scope, $rootScope, $location, $http, $window, GLOBAL_CONSTANT) {
                $scope.title = appConfig.title;
                $scope.isSubmitEmailForm = true;
                $scope.gifLoading = false;
                $scope.verification = {};

                $scope.backToLogin = function () {
                    $location.url(routes.LOGIN);
                };

                $scope.onTextBoxChange = function () {
                    $scope.isEmailNotFound = false; // remove error validation
                };

                $scope.submitEmail = function () {
                    $scope.gifLoading = true;
                    $scope.invalid = false;
                    var headers = {};
                    var postData = {
                        email: $scope.verification.submittedEmail
                    };

                    headers[httpHeader.CONTENT_TYPE] = contentTypes.JSON;

                    var req = {
                        method: httpMethods.POST,
                        url: apiRoutes.API_FORGOT_PASSWORD_VERIFY,
                        headers: headers,
                        data: postData
                    };

                    return $http(req)
                        .then(function (response) {
                            console.log("response",response);
                            if (response.status === GLOBAL_CONSTANT.HTTP_ERROR_STATUS_CODE) {
                                if (response.data.code === serverErrors.MEMBER_EMAIL_NOT_FOUND) {
                                    $scope.gifLoading = false;
                                    $scope.isEmailNotFound = true;
                                    $window.scrollTo(0, 0);
                                }

                                if (response.data.code === serverErrors.COULD_NOT_SEND_MAIL) {
                                    $rootScope = GLOBAL_CONSTANT.EMAIL_COULD_NOT_BE_SENT;
                                    $location.url(routes.ERROR_PAGE);
                                }
                            } else {
                                $scope.gifLoading = false;
                                $scope.isSubmitEmailForm = false;
                                $scope.isSubmitSuccess = true;
                                $window.scrollTo(0, 0);
                            }
                        }, function (error) {
                            $scope.gifLoading = false;
                            $rootScope.error = {};
                            $rootScope.error.status = GLOBAL_CONSTANT.UNKNOWN_ERROR_STATUS;
                            $rootScope.error.message = GLOBAL_CONSTANT.UNKNOWN_ERROR_MSG;
                            $window.scrollTo(0, 0);
                        });
                }
            }]
    });