var argv = require('optimist').argv;

require('./loader.js').startWithConfig({
  "config": __dirname + "/config.json",
  "userConf": {
    DB_NAME: argv.db
  }
}, true /* show debug message */ );
