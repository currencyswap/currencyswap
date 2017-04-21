'use strict';

angular.module('register')
    .component('register', {
        templateUrl: 'app/components/register/register.template.html',
        controller: ['$scope',
            '$rootScope',
            'RegisterService',
            'CookieService',
            '$location',
            '$http',
            '$window',
            '$base64',
            'GLOBAL_CONSTANT',
            function registerController($scope, $rootScope, RegisterService, CookieService, $location, $http, $window, $base64, GLOBAL_CONSTANT) {
                $scope.showPopover = function () {
                    $('[data-toggle="popover"]').popover();
                };
                $scope.GLOBAL_CONSTANT = GLOBAL_CONSTANT;
                $scope.user = {};
                $scope.init = function() {
                    $scope.showPopover();
                };
                if ($location.search().activeCode) {
                    $scope.startRegister = false;
                    $scope.registerSuccess = false;

                    var activeCode = $location.search().activeCode;
                    RegisterService.sendActiveRequest(activeCode)
                        .then(function (response) {
                            $rootScope.isLoading = true;
                            if (response.status === GLOBAL_CONSTANT.HTTP_ERROR_STATUS_CODE) { // handle error response
                                if (response.data.code === serverErrors.ACTIVE_ACC_CODE_NOT_FOUND) {
                                    $rootScope.isLoading = false;
                                    $rootScope.error = GLOBAL_CONSTANT.ACTIVE_CODE_EXPIRED_ERROR;

                                    return $location.url(routes.ERROR_PAGE);
                                }

                                if (response.data.code === serverErrors.COULD_NOT_DECRYPT_ACTIVE_ACC_CODE
                                || response.data.code === serverErrors.ACTIVE_ACC_CODE_DOES_NOT_MATCH
                                || response.data.code === serverErrors.NO_USER_FOUND_IN_DB) {

                                    $rootScope.isLoading = false;
                                    $rootScope.error = GLOBAL_CONSTANT.COULD_NOT_DECRYPT_ACTIVE_ACC_CODE_ERROR;

                                    return $location.url(routes.ERROR_PAGE);
                                }

                                if (response.data.code === serverErrors.SERVER_GOT_PROBLEM) {
                                    $rootScope.isLoading = false;
                                    $rootScope.error = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_ERROR;

                                    return $location.url(routes.ERROR_PAGE);
                                }


                            } else {
                                $rootScope.isLoading = false;
                                $scope.registerSuccess = false;
                                $scope.startRegister = false;
                                $scope.activeSuccess = true;
                            }
                        }, function (error) {
                            $rootScope.error = GLOBAL_CONSTANT.UNKNOWN_ERROR;
                            $window.scrollTo(0, 0);
                        });
                }

                if ($location.search().inviCode) {
                    var inviCode = $location.search().inviCode;
                    if (!validator.isBase64(inviCode)) {
                        $location.url(routes.REGISTER);
                    } else {
                        var decodedInviCode = $base64.decode(inviCode);
                        if (!decodedInviCode.indexOf(GLOBAL_CONSTANT.INVITATION_CODE_DELIMETER)) {
                            $location.url(routes.REGISTER);
                        } else {
                            var inviterAndEmail = decodedInviCode.split(GLOBAL_CONSTANT.INVITATION_CODE_DELIMETER);
                            if (!inviterAndEmail[0] || !inviterAndEmail[1]) {
                                $location.url(routes.REGISTER);
                            } else {
                                var inviter = inviterAndEmail[0];
                                var inviteeEmail = inviterAndEmail[1];
                                RegisterService.validateInviterAndInviteeEmail(inviter, inviteeEmail);
                                RegisterService.checkEmailInInvitationLink(inviteeEmail)
                                    .then(function (response) {
                                        if (response.status === GLOBAL_CONSTANT.HTTP_SUCCESS_STATUS_CODE) {
                                            $scope.user.email = inviteeEmail;
                                            $scope.user.inviteeEmail = inviteeEmail;
                                            $scope.user.inviter = inviter;
                                        } else {
                                            $rootScope.isLoading = false;
                                            $rootScope.error = GLOBAL_CONSTANT.INVITATION_CODE_USED_ERROR;
                                            $location.url(routes.ERROR_PAGE);
                                        }
                                    });
                            }
                        }
                    }
                }

                $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[0];
                $scope.altInputFormats = ['M!/d!/yyyy'];
                $scope.registerSuccess = false;
                $scope.startRegister = true;
                $scope.activeSuccess = false;
                $scope.gifLoading = false;
                $scope.userExisted = false;
                $scope.emailExisted = false;
                $scope.passportExisted = false;
                $scope.cellphoneExisted = false;
                $scope.calendar = { opened: false };
                $scope.openCalendar = function () {
                    $scope.calendar.opened = true;
                };

                $scope.onUsernameChange = function () {
                    $scope.userExisted = false;
                    $scope.emailExisted = false;
                    $scope.fieldError = 0;
                    $scope.messageErrorValidate  = '';
                };
                $scope.onEmailChange = function () {
                    $scope.userExisted = false;
                    $scope.emailExisted = false;
                    $scope.fieldError = 0;
                    $scope.messageErrorValidate  = '';
                };
                $scope.user.birthday;
                $scope.serverErrors = serverErrors;
                $scope.fieldError = 0;
                $scope.messageErrorValidate  = '';
                $scope.getMessageError = function (errorCode) {
                    $scope.gifLoading = false;
                    if (errorCode === serverErrors.USERNAME_EXCEED_MAX_LENGTH){
                        return "Username too long.";
                    }else if (errorCode === serverErrors.PASSWORD_EXCEED_MAX_LENGTH){
                        return "Password too long.";
                    }else if (errorCode === serverErrors.EMAIL_EXCEED_MAX_LENGTH){
                        return "Email too long.";
                    }else if (errorCode === serverErrors.REQUEST_NO_USERNAME){
                        return "Username is empty.";
                    }else if (errorCode === serverErrors.USERNAME_IS_NOT_STRING){
                        return "Username is invalid.";
                    }else if (errorCode === serverErrors.REQUEST_NO_PASSWORD){
                        return "Password is empty.";
                    }else if (errorCode === serverErrors.PASSWORD_IS_NOT_STRING){
                        return "Password is invalid.";
                    }else  if (errorCode === serverErrors.EMAIL_IS_NOT_STRING || errorCode === serverErrors.EMAIL_IS_INVALID){
                        return "Email is invalid.";
                    }else  if (errorCode === serverErrors.FULLNAME_IS_NOT_STRING){
                        return "Full name is invalid.";
                    }else  if (errorCode === serverErrors.FULLNAME_EXCEED_MAX_LENGTH){
                        return "Full name too long.";
                    }else  if (errorCode === serverErrors.CELLPHONE_EXCEED_MAX_LENGTH){
                        return "Cellphone too long.";
                    }else  if (errorCode === serverErrors.PROFESSION_EXCEED_MAX_LENGTH){
                        return "Profession too long.";
                    }else {
                        return "";
                    }
                }
                $scope.onSubmit = function () {
                    $scope.fieldError = 0;
                    $scope.messageErrorValidate  = '';
                    $scope.userExisted = false;
                    $scope.nationalIdExisted = false;
                    $scope.cellphoneExisted = false;
                    $scope.emailExisted = false;
                    $scope.gifLoading = true;
                    var newUser = RegisterService.compressUserDataToObj($scope.user);
                    RegisterService.submitRequest(newUser)
                        .then(function (response) {
                            if (response.status === GLOBAL_CONSTANT.HTTP_ERROR_STATUS_CODE) { //handle error response
                                $scope.fieldError = response.data.code;
                                if (response.data.code === serverErrors.TRANSACTION_INIT_FAIL
                                    || response.data.code === serverErrors.COULD_NOT_SAVE_USER_TO_DB
                                    || response.data.code === serverErrors.COULD_NOT_SAVE_USER_ADDR_TO_DB
                                    || response.data.code === serverErrors.COULD_NOT_SAVE_USER_GR_TO_DB
                                    || response.data.code === serverErrors.ERROR_TX_ROLLBACK
                                    || response.data.code === serverErrors.ERROR_TX_COMMIT) {

                                    $rootScope.isLoading = false;
                                    $rootScope.error = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_ERROR;

                                    return $location.url(routes.ERROR_PAGE);
                                }else if (response.data.code === serverErrors.USER_NAME_EXISTED) {
                                    $scope.userExisted = true;
                                    $scope.gifLoading = false;
                                    $scope.focusUsername = true;
                                }else if (response.data.code === serverErrors.EMAIL_EXISTED) {
                                    $scope.emailExisted = true;
                                    $scope.gifLoading = false;
                                    $scope.focusEmail = true;
                                }else if (response.data.code === serverErrors.NATIONAL_ID_EXISTED) {
                                    $scope.nationalIdExisted = true;
                                    $scope.gifLoading = false;
                                    $scope.focusNationalId = true;
                                }else if (response.data.code === serverErrors.CELLPHONE_EXISTED) {
                                    $scope.cellphoneExisted = true;
                                    $scope.gifLoading = false;
                                    $scope.focusCellphone = true;
                                }else {
                                    $scope.gifLoading = false;
                                    $scope.messageErrorValidate = $scope.getMessageError(response.data.code);
                                }
                            } else { //handle success response
                                $scope.gifLoading = false;
                                $scope.registerSuccess = true;
                                $scope.startRegister = false;
                                $window.scrollTo(0, 0);
                            }
                        }, function (error) {
                            $rootScope.error = GLOBAL_CONSTANT.UNKNOWN_ERROR;
                            $window.scrollTo(0, 0);
                        });
                };
                $scope.inputChanging = function () {
                    $scope.messageErrorValidate = '';
                    $scope.fieldError = 0;
                    $scope.userExisted = false;
                    $scope.nationalIdExisted = false;
                    $scope.cellphoneExisted = false;
                    $scope.emailExisted = false;
                }
                $scope.changeEmail = function () {
                    console.log("EMAIL===",$scope.user.email);
                }
                $scope.backToLogin = function () {
                    $scope.fieldError = 0;
                    $scope.messageErrorValidate  = '';
                    $location.url(routes.LOGIN);
                };
                
                // init
                $scope.init();
            }]
    });
