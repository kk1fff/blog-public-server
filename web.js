var CONF = require('./config.js'),
    l = require('./logger.js'),
    express = require('express'),
    db = require('./db.js'),
//     article = require('./article.js'),
    app = express();

app.use(express['static'](__dirname + '/pages'));
app.use(express.bodyParser());

app.post(/^\/api\/post\/update\/([0-9]+)$/, function(req, resp) {
  
});

app.post(/^\/api\/post\/create$/, function(req, resp) {

});

exports.startServer = function() {
  l.l('Listening on port: ' + CONF.get('WEB_PORT'));
  app.listen(CONF.get('WEB_PORT'));
};
