'use strict';
/**
 * @author Viet Nghiem
 */
angular.module('support').factory('SupportService', ['ConnectorService', function (ConnectorService) {
    return $.extend({}, ConnectorService, {
        saveSupport: function (support) {
            return this.post(apiRoutes.API_SUPPORTS, support);
        },
        getCreator: function(username) {
            return this.get(apiRoutes.API_SUPPORTS_CREATOR, {'username': username});
        },

        isExRateObj: function (exRateObj) {
            if (exRateObj.usDollarBuy && exRateObj.usDollarSell && exRateObj.euroBuy && exRateObj.euroSell && exRateObj.poundBuy && exRateObj.poundSell) {
                return true;
            }
            return false;
        },

        parseToExRateObj: function (message) {
            try {
                var exRateObj = JSON.parse(message);
            } catch (err) {
                return false;
            }
            return exRateObj;
        }
   });
}]);

