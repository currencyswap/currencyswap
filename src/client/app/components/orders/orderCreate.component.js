'use strict';

angular.module('orders')
    .component('orderCreate', {
        templateUrl: 'app/components/orders/orderCreate.template.html',
        controller: ['$scope',
            '$rootScope',
            'OrdersService',
            '$location',
            '$http',
            '$window',
			'$uibModal',
            'GLOBAL_CONSTANT',
            function orderCreateController($scope, $rootScope, OrdersService, $location, $http, $window, $uibModal, GLOBAL_CONSTANT) {
        		var orderCreateScope = $scope;
        		$scope.isFirstView = true;
        		
	        	$scope.currencies = [];
	        	window.scrollTo(0, 0);
        		$scope.FIXED_VALUE = GLOBAL_CONSTANT.ORDER_FIXED_VALUE;
        		$scope.EXPIRED_VALUE = GLOBAL_CONSTANT.ORDER_EXPIRED_VALUE;
        		
        		$scope.currentDate = new Date();
        		
        		$scope.suggestOrders = [];
        		
        		$scope.STATUS_PAGE_VALUE = {
        				"CREATE" : "CREATE",
        				"INITIALIZED" : "INITIALIZED"
        		}
        		
        		$scope.submitLoading = false;
        		$scope.hasError = false;
        		$scope.isDevice = $.device;
        		$scope.statusPage = $scope.STATUS_PAGE_VALUE.CREATE;
        		
        		var getCurrenciesList = function(){
        			OrdersService.getCurrenciesList().then(function(data){
        				$scope.$apply(function(){
        					$scope.currencies = data;
        					if($scope.currencies.length > 2){
        						$scope.newOrder.giveCurrencyCode = $scope.currencies[0].code;
        						$scope.newOrder.getCurrencyCode = $scope.currencies[1].code;
        					}
        				});
        			},function(err){
        				console.log("getCurrenciesList err: " + JSON.stringify(err));
        			});
        		}

        		var getLatestExchangeRate = function () {
        			OrdersService.getExchangeRate()
						.then(function (response) {
                            $scope.$apply(function () {
                                $scope.latestExRate = response;
							})
						}, function (error) {
							console.log('error when fetching latest exchange rate data: ', JSON.stringify(error));
						})
				};

        		getCurrenciesList();
        		getLatestExchangeRate();
        		
        		var getSuggestionOrders = function(){
        			var data = {
        					value : $scope.newOrder.give,
        					giveCurrencyId : $scope.newOrder.giveCurrencyId,
        					getCurrencyId : $scope.newOrder.getCurrencyId
        			}
        			
        			OrdersService.getSuggetOrders(data).then(function(data1){
        				$scope.$apply(function(){
        					$scope.suggestionOrders = data1;
        					$rootScope.suggestionOrders = data1;
        				});
        			},function(err){
        				console.log("getSuggestionOrders err: " + JSON.stringify(err));
        			});
        		};

                var suggestExRate = function () {
                    if ($scope.newOrder.giveCurrencyCode === 'NGN') {
                        if ($scope.newOrder.getCurrencyCode === 'USD') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = true;
                            $scope.suggestedEUR = false;
                            $scope.suggestedGBP = false;
                        } else if ($scope.newOrder.getCurrencyCode === 'EUR') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = false;
                            $scope.suggestedEUR = true;
                            $scope.suggestedGBP = false;
                        } else if ($scope.newOrder.getCurrencyCode === 'GBP') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = false;
                            $scope.suggestedEUR = false;
                            $scope.suggestedGBP = true;
                        } else {
                            $scope.suggested = false;
                        }
                    } else if ($scope.newOrder.getCurrencyCode === 'NGN') {
                        if ($scope.newOrder.giveCurrencyCode === 'USD') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = true;
                            $scope.suggestedEUR = false;
                            $scope.suggestedGBP = false;
                        } else if ($scope.newOrder.giveCurrencyCode === 'EUR') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = false;
                            $scope.suggestedEUR = true;
                            $scope.suggestedGBP = false;
                        } else if ($scope.newOrder.giveCurrencyCode === 'GBP') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = false;
                            $scope.suggestedEUR = false;
                            $scope.suggestedGBP = true;
                        } else {
                            $scope.suggested = false;
                        }
                    } else {
                        $scope.suggested = false;
                    }
                };

        		var getLastOrderCreated = function(){
        			OrdersService.getLastOrderCreated().then(function(data){
        				console.log("getLastOrderCreated data: " + JSON.stringify(data));
        				$scope.$apply(function(){
        					if(data && !data.isNoData && data.order){
        						$scope.newOrder.give = data.order.give;
        						$scope.newOrder.rate = data.order.rate;
        						$scope.newOrder.get = data.order.get;
        						$scope.newOrder.giveCurrencyCode = data.order.giveCurrency.code;
        						$scope.newOrder.getCurrencyCode = data.order.getCurrency.code;
        						suggestExRate();
        					} else {
                                suggestExRate();
							}
        				});
        			},function(err){
        				console.log("getLastOrderCreated err: " + JSON.stringify(err));
        			});
        		}
        		
        		if(!$scope.newOrder){
	        		$scope.newOrder = {
	        				give : "",
	        				giveCurrencyCode : "",
	        				get : "",
	        				getCurrencyCode : "",
	        				rate : "",
	        				fixed : $scope.FIXED_VALUE.RATE,
	        				expired : $scope.EXPIRED_VALUE[0].key,
	        				expiredDate : new Date(),
	        				dayLive : 0
	        		};
        		}
        		
        		if($scope.isFirstView){
        			$scope.isFirstView = false;
        			getLastOrderCreated();
        		}
        		
        		$scope.onChangeValue = function(fieldChange){
        			var NUMBER_FOR_CONVERT = 10000000;
        			
        			var get = parseInt($scope.newOrder.get);
        			var give = parseInt($scope.newOrder.give);
        			var rate = parseFloat($scope.newOrder.rate);
        			
        			if(rate > 0){
        				var rateRound = Math.round(rate * NUMBER_FOR_CONVERT);
	        			
        				$scope.newOrder.rate = rateRound / NUMBER_FOR_CONVERT;
        			}
        			
        			if($scope.newOrder.fixed == $scope.FIXED_VALUE.GIVE){
        				if(fieldChange == $scope.FIXED_VALUE.RATE){
        					if(give > 0 && rate > 0){
        						$scope.newOrder.get = give * rate;
        					}
        				}else{
        					if(give > 0 && get > 0){
        						$scope.newOrder.rate = get / give;
            				}
        				}
        			}else if($scope.newOrder.fixed == $scope.FIXED_VALUE.GET){
        				if(fieldChange == $scope.FIXED_VALUE.RATE){
        					if(rate > 0 && get > 0){
        						$scope.newOrder.give = get / rate;
        					}
        				}else{
        					if(give > 0 && get > 0){
        						$scope.newOrder.rate = get / give;
            				}
        				}
        			}else{
        				$scope.newOrder.fixed = $scope.FIXED_VALUE.RATE;
        				if(fieldChange == $scope.FIXED_VALUE.GIVE){
        					if(give > 0 && rate > 0){
        						$scope.newOrder.get = give * rate;
        					}
        				}else{
        					if(rate > 0 && get > 0){
        						$scope.newOrder.give = get / rate;
            				}
        				}
        			}
        			
        		}
        		
        		var getExpiredDate = function(){
        			for(var i in $scope.EXPIRED_VALUE){
        				if($scope.newOrder.expired == $scope.EXPIRED_VALUE[i].key){
        					return $scope.EXPIRED_VALUE[i].dayLive;
        				}
        			}
        			
        			return 0;
        		}
        		
        		/**
        		 * 	remove .00 of number text
        		 * */
        		var reFormatValue = function(numberText){
        			return parseFloat(numberText) + "";
        		}
        		
        		$scope.onNextStep = function(){
        			window.scrollTo(0, 0);
        			$scope.onChangeValue();
        			var dayLive = getExpiredDate();
        			var expiredDate = new Date();
        			expiredDate.setDate(expiredDate.getDate() + dayLive);
        			
        			$scope.newOrder.dayLive = dayLive;
        			$scope.newOrder.expiredDate = expiredDate;
        			
        			for(var i in  $scope.currencies){
        				if($scope.newOrder.getCurrencyCode == $scope.currencies[i].code){
        					$scope.newOrder.getCurrencyId = $scope.currencies[i].id;
        				}
        				
        				if($scope.newOrder.giveCurrencyCode == $scope.currencies[i].code){
        					$scope.newOrder.giveCurrencyId = $scope.currencies[i].id;
        				}
        			}
        			
        			$scope.statusPage = $scope.STATUS_PAGE_VALUE.INITIALIZED;
        			$scope.submitLoading = false;
        			$scope.hasError = false;
        			
        			getSuggestionOrders();
            	}
        		
        		$scope.onBackStep = function(){
        			
        			$scope.statusPage = $scope.STATUS_PAGE_VALUE.CREATE;
        			$scope.submitLoading = false;
        			$scope.hasError = false;
        			window.scrollTo(0, 0);
            	}
        		
        		var goToOrderList = function(){
        			location.href = "/#!/orders/";
        		}
        		
        		$scope.onSubmit = function(){
        			$scope.submitLoading = true;
        			$scope.hasError = false;
        			var newOrderRequest = {};
        			
        			newOrderRequest.give = $scope.newOrder.give;
        			newOrderRequest.get = $scope.newOrder.get;
        			newOrderRequest.rate = $scope.newOrder.rate;
        			newOrderRequest.dayLive = $scope.newOrder.dayLive;
        			newOrderRequest.getCurrencyId = $scope.newOrder.getCurrencyId;
        			newOrderRequest.giveCurrencyId = $scope.newOrder.giveCurrencyId;
        			
        			OrdersService.postSaveNewOrders(newOrderRequest).then(function(data){
        				$scope.submitLoading = false;
        				goToOrderList();
        			},function(err){
        				$scope.submitLoading = false;
        				$scope.hasError = true;
        				$scope.errorMessage = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_ERROR.message;
        			});
            	}
        		
        		$scope.checkEqualCurrency = function(){
        			return $scope.newOrder.giveCurrencyCode == $scope.newOrder.getCurrencyCode;
        		}
        		
        		$scope.checkValiedValue = function(){
        			var give = parseFloat($scope.newOrder.give);
        			var get = parseFloat($scope.newOrder.get);
        			var rate = parseFloat($scope.newOrder.rate);
        			
        			if(rate <= 0 || get <= 0 || give <= 0){
        				return false;
        			}
        			
        			return true;
        		}
        		
        		// swapping order
        		$scope.onSwap = function(orderId){
        			$scope.openMessageModel(orderId);
        		};

        		$scope.currencyChange = function () {
        			suggestExRate();
						};

                $scope.openMessageModel = function (orderId) {
                    var createModel = function(templateUrl, controller, callbackOk, callbackCancel, size) {
                        var modalForm = $uibModal.open({
                            animation: true,
                            templateUrl: templateUrl,
                            controller: controller,
                            size: size,
                            scope: $scope
                        });

                        modalForm.result.then(callbackOk||function(newData){
                                console.log('Modal output with: ', newData);
                                    OrdersService.swapSubmittedOrder(orderId, newData).then(function(resp){
                                        if(resp.isError){
                                            $scope.hasError = true;
                                            $scope.errorMessage = resp.message;
                                            //$window.alert(resp.message);
                                            getSuggestionOrders();
                                        }else{
                                            $scope.hasError = false;
                                            goToOrderList();
                                        }
                                    }, function(err){
                                        console.log('Failure in saving your message');
                                    });
                            }, callbackCancel||function () {
                                console.log('Modal dismissed at: ', new Date());
                            });
                        return modalForm;
                    };

                    createModel('app/components/orders/bankInfoConfirmation.template.html', function ($scope, $timeout, $sce, $uibModalInstance) {
                        $scope.countries = new Array( "Nigeria", "USA", "United Kingdom", "Afghanistan", "Albania", "Algeria", "American Samoa", "Angola", "Anguilla", "Antartica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Ashmore and Cartier Island", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Clipperton Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czeck Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Europa Island", "Falkland Islands (Islas Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern and Antarctic Lands", "Gabon", "Gambia, The", "Gaza Strip", "Georgia", "Germany", "Ghana", "Gibraltar", "Glorioso Islands", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City)", "Honduras", "Hong Kong", "Howland Island", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Ireland, Northern", "Israel", "Italy", "Jamaica", "Jan Mayen", "Japan", "Jarvis Island", "Jersey", "Johnston Atoll", "Jordan", "Juan de Nova Island", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Man, Isle of", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Midway Islands", "Moldova", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcaim Islands", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romainia", "Russia", "Rwanda", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Scotland", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and South Sandwich Islands", "Spain", "Spratly Islands", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tobago", "Toga", "Tokelau", "Tonga", "Trinidad", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands", "Wales", "Wallis and Futuna", "West Bank", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe");
                        $scope.submittedBankInfoObj = {};
                        $scope.submittedBankInfoObj.bankCountry = $scope.countries[0];
                        $scope.existedBankInfo = true;
                        $scope.bankInfos = $rootScope.user.bankInfo;
                        if ($scope.bankInfos.length > 0) {
                            $scope.submittedBankInfoObj.choosenExistedBankInfoId = $scope.bankInfos[0].id + "";
                        } else {
                            $scope.existedBankInfo = false;
                        }

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };

                        $scope.confirmBankInfo = function () {
                            if (!$scope.submittedBankInfoObj.bankAccountName
                                || !$scope.submittedBankInfoObj.bankAccountNumber
                                || !$scope.submittedBankInfoObj.bankName
                                || !$scope.submittedBankInfoObj.bankCountry
																|| !$scope.submittedBankInfoObj.bankSortCode
																|| !$scope.submittedBankInfoObj.bankSwiftIbanCode) {
                                $uibModalInstance.close($scope.submittedBankInfoObj);
							} else {
                                OrdersService.checkBankInfoExisted($scope.submittedBankInfoObj.bankAccountNumber)
                                    .then(function(resp){
                                        $uibModalInstance.close($scope.submittedBankInfoObj);
                                    }, function(err){
                                        $scope.submittedBankInfoObj.bankAccountName = null;
                                        $scope.submittedBankInfoObj.bankAccountNumber = null;
                                        $scope.submittedBankInfoObj.bankName = null;
																				$scope.submittedBankInfoObj.bankSortCode = null;
																				$scope.submittedBankInfoObj.bankSwiftIbanCode = null;
                                    });
							}
                        };
                    });
                };

							$scope.applyRateBuy = function() {
								if($scope.suggestedUSD) {
									$scope.newOrder.rate = $scope.latestExRate.usDollarBuy;
								}else if($scope.suggestedEUR) {
									$scope.newOrder.rate = $scope.latestExRate.euroBuy;
								}else {
									$scope.newOrder.rate = $scope.latestExRate.poundBuy;
								}
								$scope.onChangeValue();
							}
							$scope.applyRateMedian = function() {
								if($scope.suggestedUSD) {
									$scope.newOrder.rate = $scope.latestExRate.usDollarMedian;
								}else if($scope.suggestedEUR) {
									$scope.newOrder.rate = $scope.latestExRate.euroMedian;
								}else {
									$scope.newOrder.rate = $scope.latestExRate.poundMedian;
								}
								$scope.onChangeValue();
							}
							$scope.applyRateSell = function() {
								if($scope.suggestedUSD) {
									$scope.newOrder.rate = $scope.latestExRate.usDollarSell;
								}else if($scope.suggestedEUR) {
									$scope.newOrder.rate = $scope.latestExRate.euroSell;
								}else {
									$scope.newOrder.rate = $scope.latestExRate.poundSell;
								}
								$scope.onChangeValue();
							}

            }]


    });
