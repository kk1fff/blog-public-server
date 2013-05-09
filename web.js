var CONF = require('./config.js'),
    l = require('./logger.js'),
    express = require('express'),
    app = express();

app.use(express['static'](__dirname + '/pages'));

exports.startServer = function() {
  l.l('Listening on port: ' + CONF.get('WEB_PORT'));
  app.listen(CONF.get('WEB_PORT'));
};
