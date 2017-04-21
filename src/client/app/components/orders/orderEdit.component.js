'use strict';

angular.module('orders')
    .component('orderEdit', {
        templateUrl: 'app/components/orders/orderEdit.template.html',
        controller: ['$scope',
            '$rootScope',
            '$routeParams',
            'OrdersService',
            '$location',
            '$http',
            '$window',
            'GLOBAL_CONSTANT',
            function orderEditController($scope, $rootScope, $routeParams, OrdersService, $location, $http, $window, GLOBAL_CONSTANT) {
        		$scope.orderCode = $routeParams.orderCode;
        		window.scrollTo(0, 0);
	        	$scope.currencies = [];
	        	$scope.order = undefined;
	        	
	        	$scope.orderNotExisted = false;
        		
        		$scope.FIXED_VALUE = GLOBAL_CONSTANT.ORDER_FIXED_VALUE;
        		$scope.EXPIRED_VALUE = GLOBAL_CONSTANT.ORDER_EXPIRED_VALUE;
        		
        		$scope.currentDate = new Date();
        		
        		$scope.submitLoading = false;
        		$scope.hasError = false;
        		
        		var setExpired = function(created, expired){
        			var time = expired.getTime() - created.getTime();
        			var TIME_A_DAY = 1000 * 60 * 60 * 24;
        			var dayLive = time % TIME_A_DAY == 0 ? time/TIME_A_DAY : time/TIME_A_DAY + 1;
        			
        			for(var i in $scope.EXPIRED_VALUE){
        				if(dayLive == $scope.EXPIRED_VALUE[i].dayLive){
        					return $scope.EXPIRED_VALUE[i].key;
        				}
        			}
        			
        			return $scope.EXPIRED_VALUE[0].key;
        		}
        		
        		var getCurrenciesList = function(){
        			OrdersService.getCurrenciesList().then(function(data){
        				$scope.$apply(function(){
        					$scope.currencies = data;
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

                var suggestExRate = function () {
                    if ($scope.updateOrder.giveCurrencyCode === 'NGN') {
                        if ($scope.updateOrder.getCurrencyCode === 'USD') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = true;
                            $scope.suggestedEUR = false;
                            $scope.suggestedGBP = false;
                        } else if ($scope.updateOrder.getCurrencyCode === 'EUR') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = false;
                            $scope.suggestedEUR = true;
                            $scope.suggestedGBP = false;
                        } else if ($scope.updateOrder.getCurrencyCode === 'GBP') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = false;
                            $scope.suggestedEUR = false;
                            $scope.suggestedGBP = true;
                        } else {
                            $scope.suggested = false;
                        }
                    } else if ($scope.updateOrder.getCurrencyCode === 'NGN') {
                        if ($scope.updateOrder.giveCurrencyCode === 'USD') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = true;
                            $scope.suggestedEUR = false;
                            $scope.suggestedGBP = false;
                        } else if ($scope.updateOrder.giveCurrencyCode === 'EUR') {
                            $scope.suggested = true;
                            $scope.suggestedUSD = false;
                            $scope.suggestedEUR = true;
                            $scope.suggestedGBP = false;
                        } else if ($scope.updateOrder.giveCurrencyCode === 'GBP') {
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

        		var getOrderDetail = function(orderCode){
        			OrdersService.getOrderForEdit(orderCode).then(function(data){
        				$scope.$apply(function(){
        					if(data){
        						$scope.orderNotExisted = false;
        						$scope.order = data;
        						
        						$scope.updateOrder.give = $scope.order.give;
        						$scope.updateOrder.rate = $scope.order.rate;
        						$scope.updateOrder.get = $scope.order.get;
        						$scope.updateOrder.giveCurrencyCode = $scope.order.giveCurrency.code;
        						$scope.updateOrder.getCurrencyCode = $scope.order.getCurrency.code;
        						
        						var created = new Date($scope.order.created);
        	        			var expired = new Date($scope.order.expired);
        	        			$scope.updateOrder.expired = setExpired(created, expired);
        	        			$scope.updateOrder.created = $scope.order.created;
                                $scope.$apply(suggestExRate());
                            }else{
        						$scope.orderNotExisted = true;
        					}
        				});
        			},function(err){
        				$scope.orderNotExisted = true;
        				console.log("getOrderDetail err: " + JSON.stringify(err));
        			});
        		}

        		if($scope.orderCode){
        			getOrderDetail($scope.orderCode);
        		}
        		
        		$scope.updateOrder = {
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
        		
        		$scope.onChangeValue = function(fieldChange){
        			var NUMBER_FOR_CONVERT = 10000000;
        			
        			var get = parseInt($scope.updateOrder.get);
        			var give = parseInt($scope.updateOrder.give);
        			var rate = parseFloat($scope.updateOrder.rate);
        			
        			if(rate > 0){
        				var rateRound = Math.round(rate * NUMBER_FOR_CONVERT);
	        			
	        			rate = rateRound / NUMBER_FOR_CONVERT;
        			}
        			
        			if($scope.updateOrder.fixed == $scope.FIXED_VALUE.GIVE){
        				if(fieldChange == $scope.FIXED_VALUE.RATE){
        					if(give > 0 && rate > 0){
        						$scope.updateOrder.get = give * rate;
        					}
        				}else{
        					if(give > 0 && get > 0){
            					$scope.updateOrder.rate = get / give;
            				}
        				}
        			}else if($scope.updateOrder.fixed == $scope.FIXED_VALUE.GET){
        				if(fieldChange == $scope.FIXED_VALUE.RATE){
        					if(rate > 0 && get > 0){
        						$scope.updateOrder.give = get / rate;
        					}
        				}else{
        					if(give > 0 && get > 0){
            					$scope.updateOrder.rate = get / give;
            				}
        				}
        			}else{
        				$scope.updateOrder.fixed = $scope.FIXED_VALUE.RATE;
        				if(fieldChange == $scope.FIXED_VALUE.GIVE){
        					if(give > 0 && rate > 0){
        						$scope.updateOrder.get = give * rate;
        					}
        				}else{
        					if(rate > 0 && get > 0){
            					$scope.updateOrder.give = get / rate;
            				}
        				}
        			}
        		}
        		
        		var getExpiredDate = function(){
        			for(var i in $scope.EXPIRED_VALUE){
        				if($scope.updateOrder.expired == $scope.EXPIRED_VALUE[i].key){
        					return $scope.EXPIRED_VALUE[i].dayLive;
        				}
        			}
        			
        			return 0;
        		}
        		
        		var goToOrderDetail = function(code){
        			location.href = "/#!/orders/" + code;
        		}
        		
        		$scope.onSubmit = function(){
        			$scope.submitLoading = window.scrollTo(0, 0);
        			true;
        			$scope.hasError = false;
        			var updateOrderRequest = {};
        			
        			$scope.updateOrder.dayLive = getExpiredDate();
        			
        			updateOrderRequest.give = $scope.updateOrder.give;
        			updateOrderRequest.get = $scope.updateOrder.get;
        			updateOrderRequest.rate = $scope.updateOrder.rate;
        			updateOrderRequest.dayLive = $scope.updateOrder.dayLive;
        			updateOrderRequest.getCurrencyid = 0;
        			updateOrderRequest.giveCurrencyid = 0;
        			
        			for(var i in  $scope.currencies){
        				if($scope.updateOrder.getCurrencyCode == $scope.currencies[i].code){
        					updateOrderRequest.getCurrencyId = $scope.currencies[i].id;
        				}
        				
        				if($scope.updateOrder.giveCurrencyCode == $scope.currencies[i].code){
        					updateOrderRequest.giveCurrencyId = $scope.currencies[i].id;
        				}
        			}
        			
        			OrdersService.putUpdateOrder($scope.orderCode, updateOrderRequest).then(function(data){
        				$scope.submitLoading = false;
        				goToOrderDetail($scope.orderCode);
        			},function(err){
        				$scope.submitLoading = false;
        				$scope.hasError = true;
        				$scope.errorMessage = GLOBAL_CONSTANT.SERVER_GOT_PROBLEM_ERROR.message;
        			});
            	}
        		
        		$scope.checkEqualCurrency = function(){
        			return $scope.updateOrder.giveCurrencyCode == $scope.updateOrder.getCurrencyCode;
        		}
        		
        		$scope.checkValiedValue = function(){
        			var give = parseFloat($scope.updateOrder.give);
        			var get = parseFloat($scope.updateOrder.get);
        			var rate = parseFloat($scope.updateOrder.rate);
        			
        			if(rate <= 0 || get <= 0 || give <= 0){
        				return false;
        			}
        			
        			return true;
        		}
        		
        		$scope.checkShowOptionExpried = function(dayLive, created){
        			var currentDate = new Date();
        			
        			var expired = new Date(created);
                    expired.setDate(expired.getDate() + dayLive);
                    
                    if(expired.getTime() >= currentDate.getTime()){
                    	return true;
                    }else{
                    	return false;
                    }
        		}

                $scope.currencyChange = function () {
                    $scope.$apply(suggestExRate());
                }

							$scope.applyRateBuy = function() {
								if($scope.suggestedUSD) {
									$scope.updateOrder.rate = $scope.latestExRate.usDollarBuy;
								}else if($scope.suggestedEUR) {
									$scope.updateOrder.rate = $scope.latestExRate.euroBuy;
								}else {
									$scope.updateOrder.rate = $scope.latestExRate.poundBuy;
								}
								$scope.onChangeValue();
							}
							$scope.applyRateMedian = function() {
								if($scope.suggestedUSD) {
									$scope.updateOrder.rate = $scope.latestExRate.usDollarMedian;
								}else if($scope.suggestedEUR) {
									$scope.updateOrder.rate = $scope.latestExRate.euroMedian;
								}else {
									$scope.updateOrder.rate = $scope.latestExRate.poundMedian;
								}
								$scope.onChangeValue();
							}
							$scope.applyRateSell = function() {
								if($scope.suggestedUSD) {
									$scope.updateOrder.rate = $scope.latestExRate.usDollarSell;
								}else if($scope.suggestedEUR) {
									$scope.updateOrder.rate = $scope.latestExRate.euroSell;
								}else {
									$scope.updateOrder.rate = $scope.latestExRate.poundSell;
								}
								$scope.onChangeValue();
							}
            }]
    });
