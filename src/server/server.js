var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var bodyParser = require('body-parser');

require('dotenv').config({silent: true, path: path.join(__dirname, '../env.properties')});

var redis = require('./libs/redis');
var mailSender = require('./libs/mail-sender');
var logger = require('./libs/logger');

var app = module.exports = loopback();

// body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

function startUp() {
  logger.setupLogs();

  redis.setupClient();

  mailSender.initMailSender(function (err) {
    if (err) console.error(err.message);
  });

  require('./libs/generate-client-config')();
  // Bootstrap the application, configure models, datasources and middleware.
  // Sub-apps like REST API are mounted via boot scripts.
  boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module) {
        app.httpServer = app.start();
        require('./socket/websocket')(app);
        require('./router')(app);
        require('./libs/expired-checker')(app);
    }
  });
}

if (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'staging') {
  try {
    startUp();
  } catch (err) {
    console.error('ERROR : %s', err.message);
  }
} else {
  startUp();
}
