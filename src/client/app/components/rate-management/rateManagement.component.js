angular.module('rateManagement')
    .component('rateManagement', {
        templateUrl: 'app/components/rate-management/rateManagement.template.html',
        controller: ['$scope',
            '$rootScope',
            '$timeout',
            'SupportService',
            'RateManagementService',
            'PermissionService',
            'NavigationHelper',
            'GLOBAL_CONSTANT',
            function rateManagementController($scope, $rootScope, $timeout, SupportService, RateManagementService, PermissionService, NavigationHelper, GLOBAL_CONSTANT) {
                var backupData = {};
                $scope.undo = function () {
                    $scope.todayRates = angular.copy(backupData);
										$scope.mideUsRateChange = 0;
										$scope.midePoRateChange = 0;
										$scope.mideEuRateChange = 0;
                };
							  $scope.mideUsRateChange = 0;
							  $scope.midePoRateChange = 0;
							  $scope.mideEuRateChange = 0;

                $scope.saveAndSendRateToUsers = function (rate) {
                    delete rate.id;
                    $scope.gifLoading = true;
                    RateManagementService.saveAndSendRateToUsers(rate)
                        .then(function (response) {
                            $scope.$apply(function () {
                                $scope.gifLoading = false;
                            })
                        }, function (err) {
                            console.log('err from server: ', err);
                        })
                };

                var actualUSDMedian;
                var actualPoundMedian;
                var actualEuroMedian;

                RateManagementService.getLatestExchangeRate()
                    .then(function (response) {
                        console.log('response from server: ', response);
                        $scope.todayRates = response;
                        backupData = angular.copy(response);
                        actualUSDMedian = $scope.todayRates.usDollarMedian;
                        actualPoundMedian = $scope.todayRates.poundMedian;
                        actualEuroMedian = $scope.todayRates.euroMedian;
                        $scope.$apply();
                    }, function (error) {
                        console.log('error from server: ', error);
                    });

                $scope.changeDollarBuy = function (editedDollarBuyValue) {
                    $scope.todayRates.usDollarMedian =  RateManagementService.recalculateMedian(editedDollarBuyValue, $scope.todayRates.usDollarSell);
                    $scope.todayRates.usdVariant = $scope.todayRates.usDollarMedian - actualUSDMedian;
                    $scope.todayRates.usdVariantAbs = Math.abs($scope.todayRates.usdVariant);
									  if($scope.todayRates.usDollarMedian) {
											$scope.mideUsRateChange = $scope.todayRates.usDollarMedian - backupData.usDollarMedian;
											$scope.todayRates.mideUsRateChange = $scope.mideUsRateChange;
                    }else {
											$scope.mideUsRateChange = 0;
                    }
                };

                $scope.changeDollarSell = function (editedSellValue) {
                    $scope.todayRates.usDollarMedian =  RateManagementService.recalculateMedian(editedSellValue, $scope.todayRates.usDollarBuy);
                    $scope.todayRates.usdVariant = $scope.todayRates.usDollarMedian -actualUSDMedian;
                    $scope.todayRates.usdVariantAbs = Math.abs($scope.todayRates.usdVariant);
									  if($scope.todayRates.usDollarMedian) {
										    $scope.mideUsRateChange = backupData.usDollarMedian - $scope.todayRates.usDollarMedian;
											  $scope.todayRates.mideUsRateChange = $scope.mideUsRateChange;
									  }else {
										    $scope.mideUsRateChange = 0;
									  }
                };

                $scope.changePoundBuy = function (editedPoundBuyValue) {
                    $scope.todayRates.poundMedian =  RateManagementService.recalculateMedian(editedPoundBuyValue, $scope.todayRates.poundSell);
                    $scope.todayRates.poundVariant = $scope.todayRates.poundMedian - actualPoundMedian;
                    $scope.todayRates.poundVariantAbs = Math.abs($scope.todayRates.poundVariant);
									  if($scope.todayRates.poundMedian) {
										    $scope.midePoRateChange = $scope.todayRates.poundMedian - backupData.poundMedian;
											  $scope.todayRates.midePoRateChange = $scope.midePoRateChange;
									  }else {
										    $scope.midePoRateChange = 0;
									  }
                };

                $scope.changePoundSell = function (editedPoundSellValue) {
                    $scope.todayRates.poundMedian =  RateManagementService.recalculateMedian(editedPoundSellValue, $scope.todayRates.poundBuy);
                    $scope.todayRates.poundVariant = $scope.todayRates.poundMedian - actualPoundMedian;
                    $scope.todayRates.poundVariantAbs = Math.abs($scope.todayRates.poundVariant);
									  if($scope.todayRates.poundMedian) {
										    $scope.midePoRateChange = $scope.todayRates.poundMedian - backupData.poundMedian;
											  $scope.todayRates.midePoRateChange = $scope.midePoRateChange;
									  }else {
										    $scope.midePoRateChange = 0;
									  }
                };

                $scope.changeEuroBuy = function (editedEuroBuyValue) {
                    $scope.todayRates.euroMedian =  RateManagementService.recalculateMedian(editedEuroBuyValue, $scope.todayRates.euroSell);
                    $scope.todayRates.euroVariant = $scope.todayRates.euroMedian - actualEuroMedian;
                    $scope.todayRates.euroVariantAbs = Math.abs($scope.todayRates.euroVariant);
									  if($scope.todayRates.euroMedian) {
										    $scope.mideEuRateChange = $scope.todayRates.euroMedian - backupData.euroMedian;
											  $scope.todayRates.mideEuRateChange = $scope.mideEuRateChange;
									  }else {
										    $scope.mideEuRateChange = 0;
									  }
                };

                $scope.changeEuroSell = function (editedEuroSellValue) {
                    $scope.todayRates.euroMedian =  RateManagementService.recalculateMedian(editedEuroSellValue, $scope.todayRates.euroBuy);
                    $scope.todayRates.euroVariant = $scope.todayRates.euroMedian - actualEuroMedian;
                    $scope.todayRates.euroVariantAbs = Math.abs($scope.todayRates.euroVariant);
									  if($scope.todayRates.euroMedian) {
										    $scope.mideEuRateChange = $scope.todayRates.euroMedian - backupData.euroMedian;
											  $scope.todayRates.mideEuRateChange = $scope.mideEuRateChange;
									  }else {
										    $scope.mideEuRateChange = 0;
									  }
                };
            }]
    });
