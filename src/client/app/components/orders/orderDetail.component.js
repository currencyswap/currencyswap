'use strict';

angular.module('orders')
    .component('orderDetail', {
        templateUrl: 'app/components/orders/orderDetail.template.html',
        controller: ['$scope',
            '$rootScope',
            '$route',
            '$routeParams',
            'OrdersService',
            'CookieService',
            '$location',
            '$http',
            '$window',
			'$uibModal',
			'$timeout',
			'Upload',
            'GLOBAL_CONSTANT',
            function orderDetailController($scope, $rootScope, $route,$routeParams, OrdersService, CookieService, $location, $http, $window, $uibModal, $timeout, Upload, GLOBAL_CONSTANT) {
        		$window.scrollTo(0, 0);
        		$scope.submitLoading = false;
        		
        		$scope.orderNotExisted = false;
        		
        		$scope.orderCode = $routeParams.orderCode;
        		$scope.currentUser = CookieService.getCurrentUser();
        		
        		$scope.statusType = GLOBAL_CONSTANT.STATUS_TYPE;
        		$scope.orderStatus = "";
        		$scope.isOwnerOrder = false;
        		$scope.noAccepterEvidence = true;
                $scope.noOwnerEvidence = true;

                $scope.openEvidenceImageModal = function (orderCode) {
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
                            }, callbackCancel||function () {
                                console.log('Modal dismissed at: ', new Date());
                            });
                        return modalForm;
                    };

                    createModel('app/components/orders/paymentEvidenceImage.template.html', function ($scope, $timeout, $sce, $uibModalInstance) {
                        $scope.onOK = function () {
                            $uibModalInstance.dismiss();
						}
                    });
                };

                var token = CookieService.getToken();
                var headers = {};
                headers[httpHeader.CONTENT_TYPE] = contentTypes.JSON;
                headers[httpHeader.AUTHORIZARION] = autheticateType.BEARER + token;

                $scope.showEvidence = function () {
                    $scope.randomNumImg = Math.round(Math.floor(Number.MAX_SAFE_INTEGER * Math.random()));
                    $scope.openEvidenceImageModal($scope.orderCode);
				};

                $scope.uploadFiles = function(file, errFiles) {
                    $scope.f = file;
                    console.log('what is that data type: ', $scope.f);
                    $scope.errFile = errFiles && errFiles[0];
                    if ($scope.errFile && $scope.errFile.$error === 'maxSize') {
                        $window.alert('uploading file exceeds maximum size (5MB)');
                        return;
					}

					if ($scope.f.type !== 'image/*' && $scope.f.type !== 'image/png' && $scope.f.type !== 'image/jpeg') {
                    	$window.alert('uploading file is not image file (support .jpg, .jpeg, .png)');
                    	return;
					}

                    if (file) {
                        file.upload = Upload.upload({
                            method: 'POST',
                            url: apiRoutes.API_PAYMENT_EVIDENCE,
                            data: {
                            	orderCode: $scope.orderCode,
                                file: file
                            },
                            headers: headers
                        });

                        file.upload.then(function (response) {
                            $scope.randomNumImg = Math.round(Math.floor(Number.MAX_SAFE_INTEGER * Math.random()));
                            $.publish('/cs/user/update', [$rootScope.user]);
                            $timeout(function () {
                                file.result = response.data;
                            });
                        }, function (response) {
                            if (response.status > 0)
                                $scope.errorMsg = response.status + ': ' + response.data;
                        }, function (evt) {
                            file.progress = Math.min(100, Math.round(100.0 *
                                evt.loaded / evt.total));
                        });
                    }
                };

        		var getOrderDetail = function(orderCode){
        			OrdersService.getOrderByCode(orderCode).then(function(data){
        				$scope.$apply(function(){
        					if(data){
        						$scope.orderNotExisted = false;
        						$scope.order = data;
        						console.log('order data: ', $scope.order);
            					if($scope.order.owner.username == $scope.currentUser.username){
            						$scope.isOwnerOrder = true;
            					}

            					if (($scope.order.initializerBankInfo &&  $scope.order.initializerBankInfo.length > 0 && $scope.order.initializerBankInfo[0])
									&& $scope.order.accepterBankInfo &&  $scope.order.accepterBankInfo.length > 0 && $scope.order.accepterBankInfo[0]) {
            						$scope.fulfillBankInfo = true;
								}

            					$scope.orderStatus = $scope.order.status.name;
            					$scope.orderStatusId = $scope.order.status.id;
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
        		
        		var goToOrderList = function(){
        			location.href = "/#!/orders/";
//        			getOrderDetail($scope.orderCode);
        		}
        		
        		var goToEdit = function(code){
        			location.href = "/#!/orders/edit/" + code;
        		}
        		
        		// Cancel swapping order        		
        		$scope.onCancel = function(orderId){
        			var msg = '';
        			if($scope.isOwnerOrder && $scope.orderStatus == $scope.statusType.SWAPPING)
        				msg = 'State of this order will be changed to Submitted. Do you want continue?';
        			else if(!$scope.isOwnerOrder && $scope.orderStatus == $scope.statusType.SWAPPING)
        				msg = 'If you cancel, this order will be removed from your list. Do you want continue?';
        			else if($scope.orderStatus == $scope.statusType.SUBMITTED)
        				msg='If you cancel, this order will be deleted. Do you want continue?'
        			else 
        				msg = 'State of this order will be changed to Cancelled. Do you want continue?';
        			
            		var cancelOrder = $window.confirm(msg);
            	    if(cancelOrder){
            	    	$scope.submitLoading = true;
            	    	if($scope.orderStatus == $scope.statusType.SWAPPING){
            	    		OrdersService.cancelSwappingOrder(orderId).then(function(resp){
            	    			$scope.submitLoading = false;
            	    			if($scope.isOwnerOrder){
            	    				getOrderDetail($scope.orderCode);	
            	    			} else {
            	    				goToOrderList();
            	    			}
            	    			
    	                    }, function(err){
    	                    	$scope.submitLoading = false;
    	                        $window.alert('Failure to cancel action!');
    	                    });
            	    	}else if($scope.orderStatus == $scope.statusType.SUBMITTED){
            	    		OrdersService.cancelSubmittedOrder(orderId).then(function(resp){
            	    			$scope.submitLoading = false;
            	    			location.href = "/#!/orders/";
                            }, function(err){
                            	$scope.submitLoading = false;
                            	$window.alert('Failure to cancel action!');
                            });
            	    	}else{
            	    		OrdersService.cancelConfirmedOrder(orderId).then(function(resp){
            	    			$scope.submitLoading = false;
            	    			getOrderDetail($scope.orderCode);
    	                    }, function(err){
    	                    	$scope.submitLoading = false;
    	                    	$window.alert('Failure to cancel action!');
    	                    });
            	    	}
            	    }
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
                                //$scope.submitLoading = true;
                                console.log('submittedBankInfoObj: ', newData);
                                OrdersService.confirmSwappingOrder(orderId, newData).then(function(resp){
                                    $scope.submitLoading = false;
                                    getOrderDetail($scope.orderCode);
                                }, function(err){
                                    $scope.submitLoading = false;
                                    $window.alert('Failure to confirm action!');
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

        		// Confirm swapping order
        		$scope.onConfirm = function(orderId){
                    $scope.openMessageModel(orderId);
        		};
        		
        		// Clear confirmed order
        		$scope.onClear = function(orderId){
        			var msg= 'State of this order will be changed to Cleared. Do you want continue?';
//        			State of this order will be changed to Pending. Do you want continue?
            		var clearOrder = $window.confirm(msg);
            	    if(clearOrder){
            	    	$scope.submitLoading = true;
		                OrdersService.clearConfirmedOrder(orderId).then(function(resp){
		                	$scope.submitLoading = false;
		                	getOrderDetail($scope.orderCode);
	                    }, function(err){
	                    	$scope.submitLoading = false;
	                    	$window.alert('Failure to clear action!');
	                    });
            	    }
        		};
        		
        		// Clear edit order
                $scope.onEdit = function (orderCode) {
                    goToEdit(orderCode);
                };
        		
        		$scope.checkStatusCurrentUserInActivity = function(activities){
        			var isCleared = false;
        			if(activities){
            			for(var i = 0; i < activities.length; i++){
            				var activity = activities[i];
            				
            				if(activity.creator.username == $scope.currentUser.username && activity.statusId == 4){
            					isCleared = true;
            				}
            			}
        			}
        			return isCleared;
        		};

                $scope.showInitializerEvidence = function () {
                	$scope.requestedUsername = $scope.order.owner.username;
                    $scope.randomNumImg = Math.round(Math.floor(Number.MAX_SAFE_INTEGER * Math.random()));
                    $scope.openEvidenceImageModal($scope.orderCode);
                };

                $scope.showAccepterEvidence = function () {
                    $scope.requestedUsername = $scope.order.accepter.username;
                    $scope.randomNumImg = Math.round(Math.floor(Number.MAX_SAFE_INTEGER * Math.random()));
                    $scope.openEvidenceImageModal($scope.orderCode);
                };
            }]
    });
