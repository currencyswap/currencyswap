var path = require('path');
var isReqService = function (req) {
    var reqPath = req.url;
    var isReqSer = (req.xhr || (/(\/api\/|\/service)/.test(reqPath)));
    return isReqSer;
};
function errorHandler404(req, res) {

    var errMsg = 'Not Found';
    var errPage = null;


    if (isReqService(req)) {
        res.status(404).send({'error': new Error(errMsg)});
        return;
    }

    res.status(404);
    res.sendFile(path.join(__dirname, '../../../client/404.html'));
}

function errorHandler500(err, req, res, next) {
    console.error('ERROR: ', err);
    if (res.headersSent) {
        return next(err);
    }

    var code = 500;
    var message = errMsgs.ERR_SERVER_GET_PROBLEM;

    if (err && err.message) {
        message = err.message;
    } else if (err && err.code) {
        code = err.code;
    }

    if (isReqService(req)) {
        return res.status(code).send({'error': {'message': message, 'code': code}});
    }

    res.status(code);
    res.render('error', {'error': message, 'code': code});
}

module.exports.isReqService = isReqService;
module.exports.errorHandler404 = errorHandler404;
module.exports.errorHandler500 = errorHandler500;
