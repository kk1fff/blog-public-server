var CONF    = require('./config.js'),
    l       = require('./logger.js'),
    express = require('express'),
    crypto  = require('crypto');

exports.startServer = function() {
  var displayWeb = express(),
      controlWeb = express();

  require('./display-component.js').setup(displayWeb);
  l.l('Listening to disaply port: ' + CONF.get('DISPLAY_WEB_PORT'));
  displayWeb.listen(CONF.get('DISPLAY_WEB_PORT'));

  require('./control-component.js').setup(controlWeb);
  l.l('Listening to control port: ' + CONF.get('CONTROL_WEB_PORT'));
  controlWeb.listen(CONF.get('CONTROL_WEB_PORT'));
};
