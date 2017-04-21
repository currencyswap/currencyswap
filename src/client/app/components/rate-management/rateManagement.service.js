'use strict';
angular.module('rateManagement').factory('RateManagementService', ['ConnectorService', function (ConnectorService) {
    return $.extend({}, ConnectorService, {
        getLatestExchangeRate: function () {
            return this.get(apiRoutes.API_EXRATE);
        },

        recalculateMedian: function (buyValue, sellValue) {
            return Math.round((parseInt(buyValue) + parseInt(sellValue)) / 2);
        },

        saveAndSendRateToUsers: function (rate) {
            return this.post(apiRoutes.API_EXRATE, rate);
        }
    });
}]);

