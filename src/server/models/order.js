var dbUtil = require('../libs/utilities/db-util');
module.exports = function(Order) {
	Order.observe('after save', function (ctx, next) {
        if (!ctx.instance) {
            return next();
        }
        next();
    });
};
