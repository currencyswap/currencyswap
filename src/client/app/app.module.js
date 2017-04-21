'use strict';

angular.module('currencySwapApp', [
    'ngRoute',
    'cookieManager',
    'appHeader',
    'appFooter',
    'errorPage',
    'permission',
    'loginForm',
    'verifyInfo',
    'resetPassword',
    'register',
    'userList',
    'userDetails',
    'common',
    'help',
    'support',
    'notification',
    'myProfile',
    'orders',
    'invitation',
    'rateManagement',
    'ngFileUpload',
    'homePage',
    'navigation',
    'angularCountryState',
    'ngSanitize',
    'base64',
    'ui.bootstrap',
]).run(function ($window, $rootScope, $location, CookieService, PermissionService, NavigationHelper) {
    var token = CookieService.getToken();
    $rootScope.loggedIn = false;
    $rootScope.isLoading = true;
    $rootScope.error = null;
    $rootScope.currentPage = {};

    var init = function () {
        $rootScope.$on("$routeChangeStart", routeChanged);
        var isVerifyingPass = function () {
            if ($location.path() === routes.FORGOT_PASSWORD_VERIFY ||
                $location.search().resetCode || $location.search().activeCode) {
                // cleanup current session
                $rootScope.isLoading = false;
                CookieService.cleanUpCookies();
                if ($location.search().resetCode) {
                    $location.path(routes.FORGOT_PASSWORD_RESET);
                }
                if ($location.search().activeCode) {
                    $location.path(routes.REGISTER);
                }
                return true;
            }
            return false;
        };

        var isInvitationRegister = function () {
            if ($location.search().inviCode) {
                $rootScope.isLoading = false;
                CookieService.cleanUpCookies();
                $location.path(routes.REGISTER);
                return true;
            }

            return false;
        };

        if (token) {
            // exist user session but user trying to verify or reset his/her password
            if (isVerifyingPass()) {
                return;
            }

            if (isInvitationRegister()) {
                return;
            }

            retreiveUserPerm();
        } else {
            // user session not exist
            $rootScope.isLoading = false;
            if (isVerifyingPass()) {
                return;
            }

            if (isInvitationRegister()) {
                return;
            }

            if ($location.path() != routes.LOGIN) {
                return $location.path(routes.LOGIN);
            }
        }
    };


    var redirectToDefaultPath = function () {
        var curPath = $location.path();
        if (curPath == routes.LOGIN ||
            curPath == routes.ROOT ||
            curPath == routes.HOME) {

            var defaultPath = routes.HOME;

            if ($rootScope.permissions && $rootScope.permissions.USER_MANAGEMENT) {
                defaultPath = routes.USER_LIST;
            } else if ($rootScope.permissions && $rootScope.permissions.MAINTAIN_OWN_ORDERS) {
                defaultPath = routes.ORDERS;
            }

            return $location.path(defaultPath);
        }
    };

    var routeChanged = function (event, next, prev) {
        if ($rootScope.loggedIn) {
            console.log('Authorized user');
        } else {
            console.log('Unautorized user');
            var curPath = $location.path();
            if (curPath == routes.LOGIN ||
                curPath == routes.LOGOUT ||
                curPath == routes.REGISTER ||
                curPath == routes.FORGOT_PASSWORD_VERIFY ||
                curPath == routes.FORGOT_PASSWORD_RESET ||
                curPath === routes.ERROR_PAGE) {
                console.log('Valid request');
            } else {
                if (token) {
                    console.log('Request with token', curPath);
                } else {
                    console.log('Invalid request');
                    $location.path(routes.LOGIN);
                }
            }
            return;
        }
        if (!$rootScope.permissions) {
            console.log('Access denied');
            return;
        }

        redirectToDefaultPath();

        if (!NavigationHelper.checkPermission()) {
            return;
        }

        NavigationHelper.updateNavigationBar();
    };

    var retreiveUserPerm = function () {
        PermissionService.getCurrentPermission(token).then(
            function (response) {
                if (response.status === 299) {
                    if (response.data.code == serverErrors.INVALID_TOKEN_API_KEY
                        || response.data.code == serverErrors.INVALID_TOKEN_API_KEY_FOR_USER) {

                        $rootScope.isLoading = false;
                        CookieService.cleanUpCookies();
                        $location.path(routes.LOGIN);
                    }
                } else {
                    $rootScope.permissions = response.data;
                    $rootScope.loggedIn = true;
                    $rootScope.isLoading = false;

                    NavigationHelper.initNavigationBar();

                    redirectToDefaultPath();
                }


            }, function (error) {
                //var err = error.data;
                console.error('ERROR [%s] : %s.', err.code, err.message);
                $rootScope.isLoading = false;

                $rootScope.error = {};
                $rootScope.error.status = 'Unknown';
                $rootScope.error.message = 'Unknown error';
                $window.scrollTo(0, 0);
            }
        );
    };

    // running initialize
    init();
}).constant('GLOBAL_CONSTANT', {
    HTTP_SUCCESS_STATUS_CODE: 200, // returned status from server for success case
    HTTP_ERROR_STATUS_CODE: 299, // returned status from server for error case (2xx not to get browser shows the errors)
    ACTIVE_CODE_EXPIRED_ERROR: {
        name: 'ACTIVE_CODE_EXPIRED_ERROR',
        code: 410,
        status: 'ACTIVE URL IS EXPIRED',
        message: 'Your active URL is expired and removed from our system. Please help to try to register again '
    },
    COULD_NOT_DECRYPT_ACTIVE_ACC_CODE_ERROR: {
        name: 'COULD_NOT_DECRYPT_ACTIVE_ACC_CODE_ERROR',
        code: 400,
        status: 'ACTIVE URL DOES NOT EXIST',
        message: 'Your active URL does not exist in our system, maybe something wrong happens when clicking on the URL. Please try again  '
    },
    SERVER_GOT_PROBLEM_ERROR: {
        name: 'SERVER_GOT_PROBLEM_ERROR',
        code: 500,
        status: 'SERVER GOT PROBLEM',
        message: 'Something wrong happens with our server, please try again or come back later '
    },
    UNKNOWN_ERROR: {
        name: 'UNKNOWN_ERROR',
        code: 500,
        status: 'UNKNOWN ERROR',
        message: 'System got an unknown error, please try again or come back later'
    },
    BAD_REQUEST_ERROR: {
        name: 'BAD_REQUEST_ERROR',
        code: 400,
        status: 'BAD REQUEST',
        message: 'Something wrong with your request, please try again'
    },
    RESET_CODE_EXPIRED_ERROR: {
        name: 'RESET_CODE_EXPIRED_ERROR',
        code: 410,
        status: 'RESET URL IS EXPIRED',
        message: 'Your reset URL is expired and removed from our system. Please help to try again '
    },
    INVITATION_CODE_USED_ERROR: {
        name: 'INVITATION_CODE_USED_ERROR',
        code: 410,
        status: 'INVITATION CODE HAS BEEN USED',
        message: 'Your invitation link has been used'
    },
    EMAIL_COULD_NOT_BE_SENT: {
        name: 'EMAIL_COULD_NOT_BE_SENT',
        code: 503,
        status: 'EMAIL COULD NOT BE SENT',
        message: 'Something wrong happens when sending reset URL to your email, please try again '
    },
    COULD_NOT_DECRYPT_RESET_PWD_CODE_ERROR: {
        name: 'COULD_NOT_DECRYPT_RESET_PWD_CODE_ERROR',
        code: 400,
        status: 'RESET PASSWORD URL DOES NOT EXIST',
        message: 'Your reset password URL does not exist in our system, maybe something wrong happens when clicking on the URL. Please try again '
    },
    NO_PERMISSION: {
        name: 'NO_PERMISSION',
        code: 400,
        status: 'NO PERMISSION',
        message: 'You have no permission to access this page '
    },
    NOT_FOUND: {
        name: 'NOT_FOUND',
        code: 404,
        status: 'NOT FOUND',
        message: 'Page not found'
    },
    ACTIVATED_USER_STATUS: 'Activated',
    BLOCKED_USER_STATUS: 'Blocked',
    PENDING_USER_STATUS: 'Pending Approval',
    NEW_USER_STATUS: 'New',
    EXPIRED_USER_STATUS: 'Expired',
    STANDARD_USER_ROLE: 'User',
    DEACTIVATED_USER_STATUS: 'Deactivated',
    INVALID_USER_NAME_OR_PWD_MSG: 'Invalid username/password',
    EMPTY_USERNAME_OR_PASSWORD: 'Empty username/password',
    EMPTY_EMAIL: 'Empty email',
    ACCOUNT_IS_NOT_ACTIVATED_MSG: 'Account is not activated',
    ACCOUNT_IS_EXPIRED: 'Account is expired',
    ACCOUNT_IS_BLOCKED: 'Account is blocked',
    INVITATION_CODE_DELIMETER: '|',
    ORDER_FIXED_VALUE: {
        "RATE": "RATE",
        "GIVE": "GIVE",
        "GET": "GET"
    },
    ORDER_EXPIRED_VALUE: [
        {"key": "ON_3_DAY", "value": "On 3 days", "dayLive": 3},
        {"key": "ON_7_DAY", "value": "On 7 days", "dayLive": 7},
        {"key": "ON_2_WEEKS", "value": "On 2 weeks", "dayLive": 14}
    ],
    STATUS_TYPE: {
        SUBMITTED: "Submitted",
        SWAPPING: "Swapping",
        CONFIRMED: "Confirmed",
        PENDING: "Pending",
        CLEARED: "Cleared",
        CANCELED: "Cancelled",
        EXPIRED: "Expired",
        SUBMITTED_ID: 1,
        SWAPPING_ID: 2,
        CONFIRMED_ID: 3,
        PENDING_ID: 4,
        CLEARED_ID: 5,
        CANCELED_ID: 6,
        EXPIRED_ID: 7
    },
    LIMIT_FIELDS_INFO: {
        USERNAME_MIN: 5,
        USERNAME_MAX: 25,
        EMAIL_MIN: 5,
        EMAIL_MAX: 64,
        PWD_MIN: 8,
        PWD_MAX: 25,
        FULLNAME_MIN: 0,
        FULLNAME_MAX: 25,
        PROFESSION_MIN: 0,
        PROFESSION_MAX: 255,
        CELLPHONE_MIN: 0,
        CELLPHONE_MAX: 15,
        PP_NATIONAL_MIN: 0,
        PP_NATIONAL_MAX: 25,
        ADDRESS_MIN: 0,
        ADDRESS_MAX: 255,
        CITY_MIN: 0,
        CITY_MAX: 255,
        POSTCODE_MIN: 0,
        POSTCODE_MAX: 10,
        ACC_NAME_MIN: 0,
        ACC_NAME_MAX: 255,
        ACC_NUM_MIN: 0,
        ACC_NUM_MAX: 25,
        BANK_NAME_MIN: 0,
        BANK_NAME_MAX: 255
    }
}).filter('filterDate', function ($filter) {
    return function (date, format) {
        if (!format) format = 'MMM dd, yyyy';
        return $filter('date')(date, format);
    }
}).filter('filterCurrency', function ($filter) {
    return function (value, symbol, fractionSize) {
        if (!fractionSize) fractionSize = 0;
        if (!value) {
            return "";
        } else {
            value = value + "";
        }
        if (!symbol) symbol = '';

//	    if(value && value.indexOf('.') > -1){
//	    	fractionSize = value.length - value.indexOf(".") - 1;
//	    }
        return $filter('currency')(value, symbol, fractionSize);
    }
}).filter('filterRate', function ($filter) {
    return function (value, fractionSize) {
        if (!fractionSize) fractionSize = 0;
        if (!value) {
            return "";
        } else {
            value = value + "";
        }

        if (value && value.indexOf('.') > -1) {
            fractionSize = value.length - value.indexOf(".") - 1;
            if (fractionSize > 7) {
                fractionSize = 7;
            }
        }
        return $filter('number')(value, fractionSize);
    }
}).directive('formatCurrency', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var format = "currency";
            var symbol = "";
            var fractionSize = 0;

            if (!ctrl) return;

            ctrl.$formatters.unshift(function (modelValue) {
                ctrl.$setValidity('numberValied', true);
                //console.log("viewValue $formatters : " + modelValue);

                if (!modelValue) {
                    return "";
                }
                return $filter(format)(modelValue, symbol, fractionSize);
            });

            ctrl.$parsers.unshift(function (viewValue) {
                ctrl.$setValidity('numberValied', true);

                if (!viewValue) {
                    return "";
                }

                if (viewValue && viewValue.length > 20) {
                    viewValue = viewValue.substr(0, 21);
                    elem.val(viewValue);
                }

                //console.log("viewValue : " + viewValue);

                //var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                var plainNumber = viewValue.replace(/[^\d|\.+]/g, '');

                var isNumber = isNaN(plainNumber);

                //check isNumber
                if (isNumber || parseInt(plainNumber) <= 0 || plainNumber.indexOf("-") > -1 || plainNumber.indexOf(".") > -1) {
                    ctrl.$setValidity('numberValied', false);
                } else {
                    ctrl.$setValidity('numberValied', true);

                    var value = $filter(format)(plainNumber, symbol, fractionSize);
                    elem.val(value);

                    var result = value.replace(/[^\d|\.+]/g, '');
                    return result;
                }
            });
        }
    };
}]).directive('formatRate', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var NUMBER_SIZE = 7;
            var NUMBER_FOR_CONVERT = 10000000;

            var fractionSize = 0;
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (modelValue) {
                ctrl.$setValidity('numberValied', true);
                //console.log("viewValue $formatters : " + modelValue);

                if (!modelValue) {
                    return "";
                } else {
                    modelValue = modelValue + '';
                }

                if (modelValue.indexOf(".") > -1) {
                    var fractionSize = modelValue.length - modelValue.indexOf(".") - 1;
                    if (fractionSize > NUMBER_SIZE) {
                        var viewModelNumber = Math.round(parseFloat(modelValue) * NUMBER_FOR_CONVERT);
                        modelValue = viewModelNumber / NUMBER_FOR_CONVERT + "";
                    }
                }

                if (parseFloat(modelValue) == 0) {
                    ctrl.$setValidity('numberValied', false);
                }
                return modelValue;

            });

            ctrl.$parsers.unshift(function (viewValue) {
                ctrl.$setValidity('numberValied', true);

                if (!viewValue) {
                    return "";
                }

                if (viewValue && viewValue.length > 20) {
                    viewValue = viewValue.substr(0, 21);
                    elem.val(viewValue);
                }

                var isNumber = isNaN(viewValue);

                //check isNumber
                if (isNumber || parseFloat(viewValue) <= 0 || viewValue.indexOf("-") > -1) {
                    ctrl.$setValidity('numberValied', false);
                } else {
                    if (viewValue.indexOf(".") > -1) {
                        var fractionSize = viewValue.length - viewValue.indexOf(".") - 1;
                        if (fractionSize > NUMBER_SIZE) {
                            var viewValueNumber = Math.round(parseFloat(viewValue) * NUMBER_FOR_CONVERT);
                            viewValue = viewValueNumber / NUMBER_FOR_CONVERT + "";
                        }
                    }

                    if (parseFloat(viewValue) == 0) {
                        ctrl.$setValidity('numberValied', false);
                    } else {
                        viewValue = parseFloat(viewValue) + "";

                        ctrl.$setValidity('numberValied', true);

                        elem.val(viewValue);

                        return viewValue;
                    }
                }
            });
        }
    };
}]);
