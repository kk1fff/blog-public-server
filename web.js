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

function renderPostListWithRange(base, req, resp) {
  resp.setHeader('Content-Type', 'text/html');
  resp.write("<html><body>");
  db.getArticlesWithLimit('date', true, base, 10)
    .then(function(articles) {
      var i, article;
      for (i = 0; i < articles.length; ++i) {
        article = articles[i];
        resp.write('title: ');
        resp.write(article.getTitle());
        resp.write('<br />');
        resp.write('body: <br />');
        resp.write(article.getContent());
        resp.write('<br /><br />');
      }
      resp.end('</body></html>');
    }, function(err) {
      resp.end("error: " + err.msg);
    });
}

app.get(/^\/posts\/([0-9]+)$/, function(req, resp) {
  renderPostListWithRange(parseInt(req.params[0]), req, resp);
});
app.get(/^\/posts$/, renderPostListWithRange.bind(null, 0));

app.get(/^\/post\/([0-9]+)$/, function(req, resp) {
  resp.setHeader('Content-Type', 'text/html');
  resp.write("<html><body>");
  db.getArticleById(parseInt(req.params[0]))
    .then(function(article) {
      if (article) {
        resp.write('title: ');
        resp.write(article.getTitle());
        resp.write('<br />');
        resp.write('body: <br />');
        resp.write(article.getContent());
      } else {
        resp.write('article not found');
      }
      resp.end('</body></html>');
    }, function(err) {
      resp.end("error: " + err.msg);
    });
});

exports.startServer = function() {
  l.l('Listening on port: ' + CONF.get('WEB_PORT'));
  app.listen(CONF.get('WEB_PORT'));
};
