
'use strict';

angular.module('orders').factory('OrdersService', ['ConnectorService', function (ConnectorService, PermissionService) {
    return $.extend({}, ConnectorService, {
    	getLastOrderCreated: function() {
            return this.get(apiRoutes.API_ORDERS_LAST_CREATED);
        },
        getSwappingOrders: function() { //status == 2
            return this.get(apiRoutes.API_ORDERS_SWAPPING);
        },
        getConfirmedOrders: function(){ // status = 3 || 4
            return this.get(apiRoutes.API_ORDERS_CONFIRMED);
        },
        getHistoryOrders: function() { // status = 5 || 6 
            return this.get(apiRoutes.API_ORDERS_HISTORY);
        },
        getSumittedOrders: function() { // status = 1 
            return this.get(apiRoutes.API_ORDERS_SUBMITTED);
        },
     	getTotalOrderOfUser: function(){
                return this.get(apiRoutes.API_ORDERS_TOTAL);
        },
        getOrderById : function(id){
            return this.get(apiRoutes.API_ORDERS +  '/' + id);
        },
        getOrderByCode : function(orderCode){
            return this.get(apiRoutes.API_ORDERS +  '/' + orderCode);
        },
        getOrderForEdit : function(orderCode){
            return this.get(apiRoutes.API_ORDERS +  '/edit/' + orderCode);
        },
        getAllOrders: function(){
            return this.get(apiRoutes.API_ORDERS);
        },
        putUpdateOrder: function(code, updateOrder){
            var data = updateOrder;
            return this.put(apiRoutes.API_ORDERS + '/' + code, data);
        },
        getCurrenciesList: function(){
            return this.get(apiRoutes.API_CURRENCIES);
        },
        getSuggetOrders: function(data) { // status = 1 
            return this.get(apiRoutes.API_ORDERS_SUGGEST, data);
        },
        postSaveNewOrders: function(newOrder){
            var data = newOrder;
            return this.post(apiRoutes.API_ORDERS, data);
        },
        cancelSwappingOrder:function(orderId){
        	return this.get(apiRoutes.API_ORDERS_SWAPPING_CANCEL.replace(":id",orderId));
        },
        confirmSwappingOrder:function(orderId, data){
            return this.get(apiRoutes.API_ORDERS_SWAPPING_CONFIRM.replace(":id",orderId), data);
        },
        cancelConfirmedOrder: function(orderId){
            return this.get(apiRoutes.API_ORDERS_CONFIRMED_CANCEL.replace(":id",orderId));
        },
        clearConfirmedOrder:function(orderId){
            return this.get(apiRoutes.API_ORDERS_CONFIRMED_CLEAR.replace(":id",orderId));
        },
        cancelSubmittedOrder: function(orderId){
            return this.get(apiRoutes.API_ORDERS_SUBMITTED_CANCEL.replace(":id",orderId));
        },
        editSubmittedOrder: function(orderId){
            return this.get(apiRoutes.API_ORDERS_SUBMITTED_EDIT.replace(":id",orderId));
        },
        swapSubmittedOrder:function(orderId, data){
            return this.get(apiRoutes.API_ORDERS_SUBMITTED_SWAP.replace(":id",orderId), data);
        },
        getExchangeRate: function () {
            return this.get(apiRoutes.API_EXRATE);
        },
        checkBankInfoExisted: function (bankAccountNumber) {
            return this.get(apiRoutes.API_BANK_INFO_ACCOUNT.replace(":accountNumber", bankAccountNumber));
        },
        getPaymentEvidence: function (orderCode, username) {
            return this.get('/config/evidence?orderCode=' + orderCode + '&username=' + username);
        }
    });
}]);
