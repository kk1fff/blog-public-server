var CONF = require('./config.js'),
    l = require('./logger.js'),
    db = require('./db.js'),
    web = require('./web.js');

exports.startWithConfig = function startWithConfig(conf, enableDebug) {
  l.setLogEnabled(!!enableDebug);

  // conf.config is the file of default config. any futher option overrides the value
  // provided in conf.
  conf && conf.config && CONF.load(conf.config);
  conf && CONF.loadOptions(conf);

  db.loadDb(function(err) {
    if (err) {
      l.e("Opening DB error: " + err + ", exiting.");
      process.exit(1);
    }
    l.l("Db opened");
    web.startServer();
  });
};

process.on('SIGINT', function() {
  console.log("Will exit");
  db.closeDb(function () {
    l.l("Database closed");
    process.exit(0);
  });
});
