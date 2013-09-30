var CONF = require('./config.js'),
    l = require('./logger.js'),
    express = require('express'),
    db = require('./db.js'),
    Article = require('./article.js').Article,
    app = express();

app.use(express['static'](__dirname + '/pages'));
app.use(express.bodyParser());

app.post(/^\/api\/post\/update\/([0-9]+)$/, function(req, resp) {
  
});

app.post(/^\/api\/post\/create$/, function(req, resp) {
  resp.setHeader('Content-Type', 'text/json');
  db.saveArticle(new Article({
    content: req.body.content,
    title: req.body.title,
    date: new Date()}))
  .then(function(storedArticle) {
    resp.end(JSON.stringify({
      ok: true,
      data: {
        content: storedArticle.getContent(),
        title: storedArticle.getTitle(),
        date: storedArticle.getDate(),
        id: storedArticle.getId()
      }
    }));
  }, function(err) {
    resp.end(JSON.stringify({
      ok: false,
      data: {
        err: err
      }
    }));
  });
});

app.get(/^\/api\/post\/([0-9]+)$/, function(req, resp) {
  resp.setHeader('Content-Type', 'text/json');
  db.getArticleById(req.params[0])
    .then(function(article) {
      resp.end(JSON.stringify({
        ok: true,
        data: article ? {
          content: article.getContent(),
          title: article.getTitle(),
          date: article.getDate(),
          id: article.getId()
        } : null
      }));
    }, function(err) {
      resp.end(JSON.stringify({
        ok: false,
        data: {
          err: err
        }
      }));
    });
});

exports.startServer = function() {
  l.l('Listening on port: ' + CONF.get('WEB_PORT'));
  app.listen(CONF.get('WEB_PORT'));
};
