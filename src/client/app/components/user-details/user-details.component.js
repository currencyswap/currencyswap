'use strict';

angular.module('userDetails').component('userDetails', {
    templateUrl: 'app/components/user-details/user-details.template.html',
    controller: ['$scope',
        '$rootScope',
        '$routeParams',
        'CookieService',
        'PermissionService',
        '$location',
        '$http',
        '$window',
        'GLOBAL_CONSTANT',
        '$log',
        'UserDetailsServive',
        function userDetailsController($scope, $rootScope, $routeParams, CookieService, PermissionService, $location, $http, $window, GLOBAL_CONSTANT, $log, UserDetailsServive ) {

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
                if($scope.isEditting)$scope.popup1.opened = true;
            };

            $scope.open2 = function() {
                if($scope.isEditting)$scope.popup2.opened = true;
            };

            $scope.setDate = function(year, month, day) {
                $scope.dt = new Date(year, month, day);
            };


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
            var token = CookieService.getToken();
            var headers = {};

            $scope.user = {};
            $scope.selectedStatus = {};
            $scope.isEditting = false;
            $scope.formats = ['MMM dd, yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];
            $scope.altInputFormats = ['M!/d!/yyyy'];
            $scope.user.groupMember = "Standard Member";
            $scope.role = "Standard Member";
            $scope.birthday = new Date();
            $scope.message = "";
            $scope.userStatusesList = {};
            $scope.userStatusesList.activated = GLOBAL_CONSTANT.ACTIVATED_USER_STATUS;
            $scope.userStatusesList.blocked = GLOBAL_CONSTANT.BLOCKED_USER_STATUS;
            $scope.userStatusesList.pending = GLOBAL_CONSTANT.PENDING_USER_STATUS;
            $scope.userStatusesList.new = GLOBAL_CONSTANT.NEW_USER_STATUS;
            $scope.userStatusesList.deactivated = GLOBAL_CONSTANT.DEACTIVATED_USER_STATUS;
            $scope.userStatusesList.expired = GLOBAL_CONSTANT.EXPIRED_USER_STATUS;


            $scope.onChangeCellPhone = function () {
                $scope.errorCellphoneIdExisted = false;
            };

            $scope.onChangeNationalId = function () {
                $scope.errorNationalIdExisted = false;
            };

            $scope.getUserInfo = function () {

                headers[httpHeader.CONTENT_TYPE] = contentTypes.JSON;
                headers[httpHeader.AUTHORIZARION] = autheticateType.BEARER + token;
                UserDetailsServive.getUser( $routeParams.id, headers ).then(
                    function ( response ) {
                        if (response.status === GLOBAL_CONSTANT.HTTP_ERROR_STATUS_CODE) {

                        } else {
                            $scope.user = response.data;
                            console.log('user detail information: ', $scope.user);
                            $scope.user.currentCellPhone = $scope.user.cellphone;
                            $scope.user.currentNationalId = $scope.user.nationalId;
                            $scope.user.currentUserGroup = $scope.user.group;

                            $scope.user.birthday = new Date( $scope.user.birthday );
                            $scope.lastBirthday = $scope.user.birthday;
                            $scope.user.expiredDate = new Date( $scope.user.expiredDate );
                            $scope.lastExpiredDate = $scope.user.expiredDate;
                            $scope.fullName = $scope.user.fullName;
                            $scope.selectedStatus.selectedStatus = $scope.user.status;
                            if ($scope.user.groups[0].name && $scope.user.groups[0].name === 'User') {
                                $scope.groupMember = 'Standard Member';
                            }

                            if ($scope.user.groups[0].name && $scope.user.groups[0].name === 'Admin') {
                                $scope.groupMember = 'Admin';
                            }

                            if ($scope.user.inviters && $scope.user.inviters[0]) {
                                $scope.user.inviter = $scope.user.inviters[0].username;
                            }

                            if ($scope.user.invitees || $scope.user.invitees.length > 0) {
                                var inviteeUserNames = [];
                                $scope.user.invitees.forEach(function (invitee) {
                                    inviteeUserNames.push(invitee.username);
                                });
                                $scope.user.inviteesInString = inviteeUserNames.join('; ');
                            }
                        }
                    }, function ( err ) {
                        console.error("ERROR : %s", JSON.stringify( err ) );
                        $rootScope.error = {
                            status: err.status,
                            code: err.data.code,
                            message: err.data.message
                        };
                    });
            };

            $scope.getUserInfo();

            $scope.onSaveUserDetailData = function () {
                $scope.message = '';
                $scope.gifLoading = true;
                var address, city, country, postcode, state = null;
                if ($scope.user.addresses[0] && $scope.user.addresses[0].hasOwnProperty('address')) address = $scope.user.addresses[0].address;
                if ($scope.user.addresses[0] && $scope.user.addresses[0].hasOwnProperty('city')) city = $scope.user.addresses[0].city;
                if ($scope.user.addresses[0] && $scope.user.addresses[0].hasOwnProperty('state')) state = $scope.user.addresses[0].state;
                if ($scope.user.addresses[0] && $scope.user.addresses[0].hasOwnProperty('country')) country = $scope.user.addresses[0].country;
                if ($scope.user.addresses[0] && $scope.user.addresses[0].hasOwnProperty('postcode')) postcode = $scope.user.addresses[0].postcode;
                if ($scope.groupMember === 'Standard Member') $scope.groupMember = GLOBAL_CONSTANT.STANDARD_USER_ROLE;
                if ($scope.groupMember === 'Admin') $scope.groupMember = 'Admin';

                var resultUser = {
                    id: $scope.user.id,
                    username: $scope.user.username,
                    birthday: $scope.user.birthday,
                    email: $scope.user.email,
                    expiredDate: $scope.user.expiredDate,
                    fullName: $scope.user.fullName,
                    registeredDate: $scope.user.registeredDate,
                    addresses: [
                        {
                            address: address,
                            city: city,
                            country: country,
                            postcode: postcode,
                            state: state
                        }
                    ],
                    profession: $scope.user.profession,
                    cellphone: $scope.user.cellphone,
                    nationalId: $scope.user.nationalId,
                    status: $scope.selectedStatus.selectedStatus,
                    group: $scope.groupMember
                };


                var token = CookieService.getToken();
                var headers = {};

                headers[httpHeader.CONTENT_TYPE] = contentTypes.JSON;
                headers[httpHeader.AUTHORIZARION] = autheticateType.BEARER + token;
                console.log("resultUser",resultUser);
                UserDetailsServive.saveUserDetail(resultUser, headers)
                    .then(function (response) {
                        $scope.isEditting = false;
                        if (response.status === GLOBAL_CONSTANT.HTTP_ERROR_STATUS_CODE) {
                            $scope.gifLoading = false;
													  console.log("response.data.code",response.data.code);
                            if (response.data.code === serverErrors.CANNOT_SET_YOUR_OWN_ROLE) {
                                $scope.errorSetOwnRole = true;
                            }

                            if (response.data.code === serverErrors.NATIONAL_ID_EXISTED) {
                                $scope.errorNationalIdExisted = true;
                            }

                            if (response.data.code === serverErrors.CELLPHONE_EXISTED) {
                                $scope.errorCellphoneIdExisted = true;
                            }

                            if (response.data.code === serverErrors.UNKNOWN_GROUP
                                || response.data.code === serverErrors.SERVER_GET_PROBLEM
                                || response.data.code === serverErrors.CANNOT_FIND_ADDRESS_FOR_USER) {

                                $rootScope.isLoading = false;
                                $rootScope.error = {};
                                $rootScope.error.status = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_STATUS;
                                $rootScope.error.message = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_MSG;
                                $window.scrollTo(0, 0);
                            }
                        } else {
                            $scope.getUserInfo();
                            $scope.isEditting = false;
                            $scope.gifLoading = false;
                            $scope.message = 'Successful: '+ $scope.user.username  + '\'s info has been updated';
                        }
                    }, function (error) {
											  console.log("error",error);
                        $scope.isEditting = false;
                        $scope.gifLoading = false;
                        $rootScope.error = GLOBAL_CONSTANT.UNKNOWN_ERROR;
                        $location.url(routes.ERROR_PAGE);
                        $scope.message = 'Error: Update failed';
                    });

            };

            $scope.changeStateToEdit = function () {
                $scope.isEditting = true;
                $scope.isValidBirthday = true;
                $scope.errorCellphoneIdExisted = false;
                $scope.errorNationalIdExisted = false;
                $scope.user.cellphone = $scope.user.currentCellPhone;
                $scope.user.nationalId = $scope.user.currentNationalId;
            };
            $scope.changeRole = function () {
                $scope.errorSetOwnRole = false;
            };
            $scope.onBackStep = function(){
                $location.path(routes.USER_LIST);
                $window.scrollTo(0, 0);
            };
            $scope.checkBirthdayValid = function () {
                var dateSelected = new Date($scope.user.birthday);
                if(dateSelected > new Date()) {
                    $scope.isValidBirthday = false;
                }else {
                    $scope.isValidBirthday = true;
                }
            }
            
            $scope.changeExpiredDate = function () {
                var expiredDate = new Date($scope.user.expiredDate);
                if(expiredDate > new Date()) {
                    $scope.selectedStatus.selectedStatus = $scope.userStatusesList.activated;
                }
            }
        }]
});
