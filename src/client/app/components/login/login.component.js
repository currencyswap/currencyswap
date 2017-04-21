'use strict';

angular.module('loginForm')
    .component('loginForm', {
        templateUrl: 'app/components/login/login.template.html',
        controller: ['$scope',
            '$rootScope',
            '$location',
            '$window',
            'CookieService',
            'LoginService',
            'PermissionService','OrdersService',
            'NavigationHelper',
            'GLOBAL_CONSTANT',
            function loginController($scope, $rootScope, $location, $window, CookieService, LoginService, PermissionService, OrdersService, NavigationHelper, GLOBAL_CONSTANT) {
                $scope.title = appConfig.title;
                $scope.errors = [];
                $scope.isExpired = false;
                $scope.user = {'username': localStorage.getItem( 'username' )||'', 'password': ''};

                $scope.onUsernameChange = function () {
                    $scope.loginErrMsg = null;
                };

                $scope.onPasswordChange = function () {
                    $scope.loginErrMsg = null;
                };

                $scope.onSubmit = function () {
                    LoginService.authenticate($scope.user)
                        .then(function (response) {
                            if (response.data.expire === "expired") {
                                console.log('response.data.expire: ', response.data.expire);
                                $scope.isExpired = true;
                            } else {
                                if (response.status === GLOBAL_CONSTANT.HTTP_SUCCESS_STATUS_CODE) {
                                    var newToken = response.data.token;
                                    CookieService.setUpCookies(newToken);

                                    PermissionService.getCurrentPermission(newToken)
                                        .then(function (response) {
                                                if (response.status === GLOBAL_CONSTANT.HTTP_ERROR_STATUS_CODE) {
                                                    CookieService.cleanUpCookies();

                                                    if (response.data.code === serverErrors.INVALID_AUTHORIZATION_HEADER
                                                        || response.data.code === serverErrors.PERMISSION_DENIDED
                                                        || response.data.code === serverErrors.INVALID_TOKEN_API_KEY
                                                        || response.data.code === serverErrors.INVALID_PERMISSION) {
                                                        $rootScope.error = GLOBAL_CONSTANT.NO_PERMISSION;
                                                        return $location.url(routes.ERROR_PAGE);
                                                    }

                                                    if (response.data.code === serverErrors.MEMBER_INVALID_USERNAME) {
                                                        $rootScope.error = GLOBAL_CONSTANT.BAD_REQUEST_ERROR;
                                                        return $location.url(routes.ERROR_PAGE);
                                                    }

                                                    if (response.data.code === serverErrors.SERVER_GET_PROBLEM) {
                                                        $rootScope.error = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_ERROR;
                                                        return $location.url(routes.ERROR_PAGE);
                                                    }
                                                } else {
                                                    $rootScope.permissions = response.data;
                                                    $rootScope.loggedIn = true;
                                                    localStorage.setItem( 'username', $scope.user.username );

                                                    $location.path(routes.HOME);

                                                    if ($rootScope.permissions && $rootScope.permissions.USER_MANAGEMENT) {
                                                        $location.path(routes.USER_LIST);
                                                    }

                                                    if ($rootScope.permissions && $rootScope.permissions.MAINTAIN_OWN_ORDERS) {
                                                    	
                                                    	OrdersService.getTotalOrderOfUser().then(function(data){
                                                    		if(data.count == 0){
                                                    			$location.path(routes.ORDER_CREATE);
                                                    		} else {
                                                    			$location.path(routes.ORDERS);
                                                    		}
                                                    	}, function(err){
                                                    		$location.path(routes.ORDERS);	
                                                    	});
                                                        
                                                    }

                                                    NavigationHelper.initNavigationBar();
                                                    if (!$rootScope.user) {
                                                        $rootScope.getCreator().then(function(resp){
                                                        }, function(e){
                                                            console.log(e);
                                                        });
                                                    }
                                                }
                                            },
                                            function (error) {
                                                CookieService.cleanUpCookies();
                                            }
                                        );
                                } else {
                                    if (response.data.code === serverErrors.INVALID_HTTP_HEADER
                                        || response.data.code === serverErrors.INVALID_AUTHORIZATION_HEADER
                                        || response.data.code === serverErrors.REDIS_SERVER_GET_PROBLEM
                                        || response.data.code === serverErrors.MISSING_REDIS_KEY
                                        || response.data.code === serverErrors.INVALID_TOKEN_API_KEY
                                        || response.data.code === serverErrors.SERVER_GOT_PROBLEM) {

                                        $rootScope.error = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_ERROR;
                                        return $location.url(routes.ERROR_PAGE);
                                    } else {

                                        if (response.data.code === serverErrors.MEMBER_INVALID_PASSWORD
                                            || response.data.code === serverErrors.MEMBER_INVALID_USERNAME) {

                                            $scope.loginErrMsg = GLOBAL_CONSTANT.INVALID_USER_NAME_OR_PWD_MSG;
                                        }

                                        if (response.data.code === serverErrors.ACCOUNT_IS_NOT_ACTIVATED) {

                                            $scope.loginErrMsg = GLOBAL_CONSTANT.ACCOUNT_IS_NOT_ACTIVATED_MSG;
                                        }

                                        if (response.data.code === serverErrors.ACCOUNT_IS_EXPIRED) {
                                            $scope.loginErrMsg = GLOBAL_CONSTANT.ACCOUNT_IS_EXPIRED;
                                        }

                                        if (response.data.code === serverErrors.ACCOUNT_IS_BLOCKED) {
                                            $scope.loginErrMsg = GLOBAL_CONSTANT.ACCOUNT_IS_BLOCKED;
                                        }
                                    }
                                }
                            }
                        }, function (error) {
                            if (error && error.message === GLOBAL_CONSTANT.EMPTY_USERNAME_OR_PASSWORD) {
                                $scope.loginErrMsg = GLOBAL_CONSTANT.EMPTY_USERNAME_OR_PASSWORD;
                            }
                        })
                };

                $scope.onForgotPassword = function () {
                    $location.path(routes.FORGOT_PASSWORD_VERIFY);
                };

                $scope.onRegister = function () {
                    $location.path(routes.REGISTER);
                };
                // init
                var token = CookieService.getToken();
                if (token) {
                    return $location.path(routes.HOME);
                }
            }]
    });
