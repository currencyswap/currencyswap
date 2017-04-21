'use strict';

angular.module('invitation')
    .component('invitation', {
        templateUrl: 'app/components/invitation/invitation.template.html',
        controller: ['$scope',
            '$rootScope',
            '$location',
            '$http',
            '$window',
            'InvitationService',
            'GLOBAL_CONSTANT',
            function inviteController($scope, $rootScope, $location, $http, $window, InvitationService, GLOBAL_CONSTANT) {
                $scope.title = appConfig.title;
                $scope.isSubmitEmailForm = true;

                $scope.submitEmail = function (submittedEmail) {
                    $scope.gifLoading = true;
                    InvitationService.invite(submittedEmail)
                        .then(function (response) {
                            $scope.gifLoading = false;
                            $scope.isSubmitSuccess = true;
                            $scope.$apply();
                        }, function (err) {
                            $scope.gifLoading = false;
                            $scope.$apply();
                            console.log('error on submit invite request');
                        })
                };

                $scope.onTextBoxChange = function () {
                    $scope.isEmailExisted = false;
                }
            }]
    });