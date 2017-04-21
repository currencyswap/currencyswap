'use strict';
/**
 * @author Viet Nghiem
 */
var Q = require('q');

exports.executeSQL = function(dbModal, sql, params) {
    var def = Q.defer();
    dbModal.dataSource.connector.execute( sql, params, function(err, resp) {
            if (err) {
                def.reject(err);
            } else {
                def.resolve(resp);
            }
    });
    return def.promise;
};

exports.executeModelFn = function() {
    var def = Q.defer();
    if (arguments.length < 3) {
            def.reject({'error': 'invalid query'});
    } else {
            var model = arguments[0];
            var fn = arguments[1];
            var params = Array.prototype.slice.call(arguments, 2);
            params.push(function done(err, resp) {
                    if (err) {
                        def.reject(err);
                    } else {
                        def.resolve(resp);
                    }
            });
            model[fn].apply(model, params);
    }
    return def.promise;
};