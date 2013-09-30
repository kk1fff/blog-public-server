var CONF    = require('./config.js'),
    l       = require('./logger.js'),
    db      = require('./db.js'),
    Article = require('./article.js').Article,
    express = require('express'),
    app     = express();

app.use(express['static'](__dirname + '/pages'));
app.use(express.bodyParser());

function createOrUpdate(type, req, resp) {
  var id;
  resp.setHeader('Content-Type', 'text/json');
  if (type === 'update') {
    try {
      id = parseInt(req.params[0]);
    } catch (e) {
      resp.end(JSON.stringify({
        ok: false,
        data: {
          err: 'ID is required when updating an article'
        }
      }));
      return;
    }
  }

  db.saveArticle(new Article({
    content: req.body.content,
    title:   req.body.title,
    date:    new Date(req.body.date),
    id:      type === 'create' ? undefined : id
  }))
  .then(function(storedArticle) {
    resp.end(JSON.stringify({
      ok: true,
      data: storedArticle ? {
        content: storedArticle.getContent(),
        title:   storedArticle.getTitle(),
        date:    storedArticle.getDate(),
        id:      storedArticle.getId()
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
}

app.post(/^\/api\/post\/([0-9]+)\/update$/, createOrUpdate.bind(null, 'update'));

app.post(/^\/api\/post\/create$/, createOrUpdate.bind(null, 'create'));

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
