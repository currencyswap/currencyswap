'use strict';

angular.module('orders')
    .component('orders', {
        templateUrl: 'app/components/orders/ordersList.template.html',
        controller: ['$scope',
            '$rootScope',
            'CookieService',
            'OrdersService',
            'PermissionService',
            '$location',
            '$http',
            '$window',
			'$uibModal',
            'GLOBAL_CONSTANT',
            '$log',
            function ordersController($scope, $rootScope, CookieService, OrdersService, PermissionService, $location, $http, $window, $uibModal, GLOBAL_CONSTANT, $log) {
        		$scope.swappingOrders = [];
        		$scope.confirmOrders = [];
        		$scope.historyOrders = [];
        		$scope.submittedOrders = [];
        		$scope.currentUser = CookieService.getCurrentUser();
        		$scope.status = ["Submitted", "Swapping", "Confirmed", "Pending", "Cleared", "Cancelled"];
        		$scope.tab = 1;
        		window.scrollTo(0, 0);
        		var getSwappingOrders = function () {
	                OrdersService.getSwappingOrders().then(function(resp){
	            		$scope.swappingOrders = resp;
	            		$scope.$evalAsync();
                    }, function(err){
                        console.log('Failure in saving your message');
                    });
        		};
        		$scope.reverse = {'working': false, 'confirmed': false, 'submitted': false, 'history': false};
        		$scope.propertyName = {'working': 'updated', 'confirmed': 'updated', 'submitted': 'updated', 'history': 'updated'};
        		$scope.sortBy = function(propertyName, listName) {
        		    $scope.reverse[listName] = ($scope.propertyName[listName] === propertyName) ? !$scope.reverse[listName] : false;
        		    $scope.propertyName[listName] = propertyName;
        		  };
        		var getConfirmedOrders = function () {
        			if($.device){
        				$scope.tab = 4;
        			}
	                OrdersService.getConfirmedOrders().then(function(resp){
	            		$scope.confirmOrders = resp;
	            		$scope.$evalAsync();
                    }, function(err){
                        console.log('Failure in saving your message');
                    });
        		};
        		$scope.getConfirmedOrders = getConfirmedOrders;
        		$scope.getWorkingOrders = function(){
        			$scope.tab = 1;
        			window.scrollTo(0, 0);
        			getSwappingOrders();
        			if(!$.device)
        				getConfirmedOrders();
        		};
        		
        		var getSubmittedOrders = function(){
	                OrdersService.getSumittedOrders().then(function(resp){
	            		$scope.submittedOrders = resp;
	            		$scope.$evalAsync();
                    }, function(err){
                        console.log('Failure in saving your message');
                    });
        		};
        		$scope.getSubmittedOrders = function(){
        			$scope.tab = 2;
        			window.scrollTo(0, 0);
        			getSubmittedOrders();
        		};
        		var getHistoryOrders = function(){
	                OrdersService.getHistoryOrders().then(function(resp){
	            		$scope.historyOrders = resp;
	            		$scope.$evalAsync();
                    }, function(err){
                        console.log('Failure in saving your message');
                    });
        		};
        		$scope.getHistoryOrders = function(){
        			$scope.tab = 3;
        			window.scrollTo(0, 0);
        			getHistoryOrders();
        		}
        		$scope.isDevice = $.device;
        		$scope.getWorkingOrders();
        		var getOrderById = function(orderId){
	                OrdersService.getOrderById(orderId).then(function(resp){
	            		$scope.$evalAsync();
                    }, function(err){
                        console.log('Failure in saving your message');
                    });
        		};
        		$scope.getOrderById = getOrderById;
        		// Cancel swapping order        		
        		var cancelSwappingOrder = function(orderId, ownerUsername){
        			var msg = 'If you cancel, this order will be removed from your list. Do you want continue?';
        			if($scope.currentUser.username==ownerUsername)
        				msg = 'State of this order will be changed to Submitted. Do you want continue?';
            		var cancelOrder = $window.confirm(msg);
            	    if(cancelOrder){
		                OrdersService.cancelSwappingOrder(orderId).then(function(resp){
		                	if(resp.isError){
		                		alert(resp.message);
		                	}
		                	getSwappingOrders();
	                    }, function(err){
	                        console.log('Failure in saving your message');
	                    });
            	    }
        		};
        		$scope.cancelSwappingOrder = cancelSwappingOrder;
        		// Confirm swapping order
        		var confirmSwappingOrder = function(orderId){
            		var swappingOrder = $window.confirm('State of this order will be changed to Confirmed. Do you want continue?');
            	    if(swappingOrder){
		                OrdersService.confirmSwappingOrder(orderId).then(function(resp){
		                	if(resp.isError){
		                		alert(resp.message);
		                	}
		                	getSwappingOrders();
		            		getConfirmedOrders();
	                    }, function(err){
	                        console.log('Failure in saving your message');
	                    });
            	    }
        		};
        		//$scope.confirmSwappingOrder = confirmSwappingOrder;
                $scope.confirmSwappingOrder = function(orderId){
                    $scope.openMessageModel(orderId);
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
                                OrdersService.confirmSwappingOrder(orderId, newData).then(function(resp){
                                    if(resp.isError){
                                        alert(resp.message);
                                    }
                                    getSwappingOrders();
                                    getConfirmedOrders();
                                }, function(err){
                                    console.log('Failure in saving your message');
                                });
                            }, callbackCancel||function () {
                                console.log('Modal dismissed at: ', new Date());
                            });
                        return modalForm;
                    };

                    createModel('app/components/orders/bankInfoConfirmation.template.html', function ($scope, $timeout, $sce, $uibModalInstance) {
                        $scope.countries = new Array("Nigeria", "USA", "United Kingdom", "Afghanistan", "Albania", "Algeria", "American Samoa", "Angola", "Anguilla", "Antartica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Ashmore and Cartier Island", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Clipperton Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo, Democratic Republic of the", "Congo, Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czeck Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Europa Island", "Falkland Islands (Islas Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern and Antarctic Lands", "Gabon", "Gambia, The", "Gaza Strip", "Georgia", "Germany", "Ghana", "Gibraltar", "Glorioso Islands", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands", "Holy See (Vatican City)", "Honduras", "Hong Kong", "Howland Island", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Ireland, Northern", "Israel", "Italy", "Jamaica", "Jan Mayen", "Japan", "Jarvis Island", "Jersey", "Johnston Atoll", "Jordan", "Juan de Nova Island", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Man, Isle of", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Midway Islands", "Moldova", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcaim Islands", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romainia", "Russia", "Rwanda", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Scotland", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and South Sandwich Islands", "Spain", "Spratly Islands", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Tobago", "Toga", "Tokelau", "Tonga", "Trinidad", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands", "Wales", "Wallis and Futuna", "West Bank", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe");
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

        		// Cancel confirmed order        		
        		var cancelConfirmedOrder = function(orderId, statusId){
        			var msg = 'State of this order will be changed to Cancelled. Do you want continue?';
            		var cancelOrder = $window.confirm(msg);
            	    if(cancelOrder){
		                OrdersService.cancelConfirmedOrder(orderId).then(function(resp){
		                	if(resp.isError){
		                		alert(resp.message);
		                	}
		                	if(!$.device){
		                		$scope.getWorkingOrders();
		                	}else{ 
		                		getConfirmedOrders();
		                	}

	                    }, function(err){
	                        console.log('Failure in saving your message');
	                    });
            	    }
        		};
        		$scope.cancelConfirmedOrder = cancelConfirmedOrder;
        		// Clear confirmed order
        		var clearConfirmedOrder = function(orderId, statusId){
        			var msg = 'State of this order will be changed to Pending. Do you want continue?';
        			if(statusId == 4){
        				msg= 'State of this order will be changed to Cleared. Do you want continue?';
        			}

            		var clearOrder = $window.confirm(msg);
            	    if(clearOrder){
		                OrdersService.clearConfirmedOrder(orderId).then(function(resp){
		                	if(resp.isError){
		                		alert(resp.message);
		                	}
		                	if(!$.device){
		                		$scope.getWorkingOrders();
		                	}else{ 
		                		getConfirmedOrders();
		                	}
	                    }, function(err){
	                        console.log('Failure in saving your message');
	                    });
            	    }
        		};
        		$scope.clearConfirmedOrder = clearConfirmedOrder;
        		// Cancel submitted order
        		var cancelSubmittedOrder = function(orderId){
            		var cancelOrder = $window.confirm('If you cancel, this order will be deleted. Do you want continue?');
            	    if(cancelOrder){
    	                OrdersService.cancelSubmittedOrder(orderId).then(function(resp){
		                	if(resp.isError){
		                		alert(resp.message);
		                	}
    	                	getSubmittedOrders();
                        }, function(err){
                            console.log('Failure in saving your message');
                        });
            	    }
        		};
        		$scope.cancelSubmittedOrder = cancelSubmittedOrder;
        		// Edit submitted order
        		var editSubmittedOrder = function(orderCode){
        			//var editOrder = $window.confirm('Are you sure you want to edit the Order?');
        			//if(editOrder){
        				location.href = "/#!/orders/edit/" + orderCode;
        			//}

        		};
        		$scope.editSubmittedOrder = editSubmittedOrder;
        		$scope.checkStatusCurrentUserInActivity = function(activities){
        			var isCleared = false;
        			if(activities && activities.length > 0){
        				var activity = activities[0];
        				if(activity.creator.username == $scope.currentUser.username && activity.statusId == 4){
        					isCleared = true;
        				}
        			}
        			return isCleared;
        		}
            }]
    });
