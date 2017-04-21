'use strict';

angular.module('userList')
    .filter('offset', function() {
    return function(input, start) {
        return input.slice(start);
    };
}).component('userList', {
        templateUrl: 'app/components/usersList/userList.template.html',
        controller: ['$scope',
            '$rootScope',
            'UserListService',
            'CookieService',
            'PermissionService',
            '$location',
            '$http',
            '$window',
            'GLOBAL_CONSTANT',
            '$log',
            function userListController($scope, $rootScope, UserListService,CookieService, PermissionService, $location, $http, $window, GLOBAL_CONSTANT, $log) {
                $window.scrollTo(0,0);
                // =====Date picker - START=====
                $scope.today = function() {
                    $scope.dt = new Date();
                };
                $scope.today();
                $scope.isEditting = false;
                $scope.clear = function() {
                    $scope.dt = null;
                };

                $scope.inlineOptions = {
                    customClass: getDayClass,
                    minDate: new Date(),
                    showWeeks: true
                };

                $scope.dateOptions = {
                    dateDisabled: disabled,
                    formatYear: 'yy',
                    maxDate: new Date(2020, 5, 22),
                    minDate: new Date(),
                    startingDay: 1
                };

                // Disable weekend selection
                function disabled(data) {
                    var date = data.date,
                        mode = data.mode;
                    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
                }

                $scope.toggleMin = function() {
                    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
                };

                $scope.toggleMin();

                $scope.open1 = function() {
                    $scope.popup1.opened = true;
                };

                $scope.open2 = function() {
                    $scope.popup2.opened = true;
                };

                $scope.setDate = function(year, month, day) {
                    $scope.dt = new Date(year, month, day);
                };

                $scope.role = "Standard Member";
                $scope.formats = ['MMM dd, yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[0];
                $scope.altInputFormats = ['M!/d!/yyyy'];

                $scope.birthday = new Date();

                $scope.popup1 = {
                    opened: false
                };

                $scope.popup2 = {
                    opened: false
                };

                var tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                var afterTomorrow = new Date();
                afterTomorrow.setDate(tomorrow.getDate() + 1);
                $scope.events = [
                    {
                        date: tomorrow,
                        status: 'full'
                    },
                    {
                        date: afterTomorrow,
                        status: 'partially'
                    }
                ];

                function getDayClass(data) {
                    var date = data.date,
                        mode = data.mode;
                    if (mode === 'day') {
                        var dayToCheck = new Date(date).setHours(0,0,0,0);

                        for (var i = 0; i < $scope.events.length; i++) {
                            var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

                            if (dayToCheck === currentDay) {
                                return $scope.events[i].status;
                            }
                        }
                    }

                    return '';
                }
                // =====Date picker - END=====
                $scope.STATUS_PAGE_VALUE = {
                    "USERINFO" : "USERINFO",
                    "USERLIST" : "USERLIST"
                }

                $scope.TABSELECTED = {
                    "ALL" : "ALL",
                    "ACTIVATED" : "ACTIVATED",
                    "PENDING":"PENDING"
                }
                $scope.statusPage = $scope.STATUS_PAGE_VALUE.USERLIST;
                $scope.tab = $scope.TABSELECTED.ALL;
                $scope.sortType     = 'fullName'; // set the default sort type
                $scope.sortReverse  = false;  // set the default sort order
                $scope.isDevice = $.device;
                $scope.usersAll = [];
                $scope.usersActivated = [];
                $scope.usersPending = [];
                $scope.userDetail = {};
                $scope.userDetail.groupMember = "Standard Member";

                $scope.current = 1;
                $scope.itemsPerPage = global.NUMBER_PAGING;
                $scope.maxSize = 1;

                $scope.detailUserView = false;

                $scope.userStatusesList = {};
                $scope.userStatusesList.activated = GLOBAL_CONSTANT.ACTIVATED_USER_STATUS;
                $scope.userStatusesList.blocked = GLOBAL_CONSTANT.BLOCKED_USER_STATUS;
                $scope.userStatusesList.pending = GLOBAL_CONSTANT.PENDING_USER_STATUS;
                $scope.userStatusesList.new = GLOBAL_CONSTANT.NEW_USER_STATUS;
                $scope.userStatusesList.deactivated = GLOBAL_CONSTANT.DEACTIVATED_USER_STATUS;

                $scope.selectedStatus = {};
                $scope.errorSetOwnRole = false;

                $scope.listStatus = [GLOBAL_CONSTANT.ACTIVATED_USER_STATUS,GLOBAL_CONSTANT.PENDING_USER_STATUS,GLOBAL_CONSTANT.BLOCKED_USER_STATUS];

                $scope.randomNumImg = 0;
                $scope.formatDate = function(date){
                    var dateOut = new Date(date);
                    return dateOut;
                };
                $scope.changeStateToEdit = function () {
                    $scope.isEditting = true;
                };

                $scope.getUserInfo = function () {
                    $scope.randomNumImg = parseInt(Math.floor(Number.MAX_SAFE_INTEGER * Math.random()));
                    $scope.tab = $scope.TABSELECTED.ALL;
                    $scope.errorSetOwnRole = false;
                    $scope.isEditting = false;
                    $scope.detailUserView = false;

                    $scope.usersAll = [];
                    var token = CookieService.getToken();
                    var headers = {};

                    headers[httpHeader.CONTENT_TYPE] = contentTypes.JSON;
                    headers[httpHeader.AUTHORIZARION] = autheticateType.BEARER + token;
                    var  success = function () {
                        console.log("success");
                    };
                    var  failed = function () {
                        console.log("failed");
                    };
                    UserListService.fetchAllUser(headers,success,failed)
                        .then(function (response) {
                            if (response.status === GLOBAL_CONSTANT.HTTP_SUCCESS_STATUS_CODE) {
                                $scope.usersAll = response.data;
                                $scope.usersAll.forEach(function (user) {
                                    if (user.status === GLOBAL_CONSTANT.ACTIVATED_USER_STATUS) {
                                        $scope.usersActivated.push(user)
                                    } if (user.status === GLOBAL_CONSTANT.PENDING_USER_STATUS) {
                                        $scope.usersPending.push(user);
                                    }
                                });
                                $scope.$evalAsync();
                            } else {
                                $rootScope.error = {};
                                $rootScope.error.status = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_STATUS;
                                $rootScope.error.message = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_MSG;
                                $window.scrollTo(0, 0);
                            }
                        });
                };
                $scope.onAllClick = function () {
                    $scope.randomNumImg = parseInt(Math.floor(Number.MAX_SAFE_INTEGER * Math.random()));
                    $scope.tab = $scope.TABSELECTED.ALL;
                    $scope.errorSetOwnRole = false;
                    $scope.isEditting = false;
                    $scope.detailUserView = false;
                    $scope.totalItems = $scope.usersAll.length;
                    $scope.$evalAsync();
                };

                $scope.onActivatedClick = function () {
                    $scope.tab = $scope.TABSELECTED.ACTIVATED;
                    $scope.detailUserView = false;
                    $scope.isEditting = false;
                    $scope.totalItems = $scope.usersActivated.length;
                };

                $scope.onPendingClick = function () {
                    $scope.tab = $scope.TABSELECTED.PENDING;
                    $scope.detailUserView = false;
                    $scope.isEditting = false;
                    $scope.totalItems = $scope.usersPending.length;
                };

                $scope.initalizeInfo = function () {
                    $scope.getUserInfo();
                    $scope.onAllClick();
                };

                $scope.initalizeInfo();
            }]
    });
