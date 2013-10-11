var CONF = require('./config.js'),
    l = require('./logger.js'),
    db = require('./db.js'),
    web = require('./web.js');

exports.startWithConfig = function startWithConfig(conf, enableDebug) {
  l.setLogEnabled(!!enableDebug);

  // conf.config is the file of default config. any futher option overrides the value
  // provided in conf.
  conf && conf.config && CONF.load(conf.config);
  conf && conf.userConf && CONF.loadOptions(conf.userConf);

  db.loadDb()
    .then(function() {
      l.l("Db opened");
      web.startServer();
    }, function(err) {
      l.e("Opening DB error: " + err + ", exiting.");
      process.exit(1);
    });
};

process.on('SIGINT', function() {
  console.log("Will exit");
  db.closeDb()
    .then(function () {
      l.l("Database closed");
      process.exit(0);
    });
});
