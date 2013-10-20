var db        = require('./db.js'),
    Article   = require('./article.js').Article,
    respUtils = require('./resp-utils.js'),
    express   = require('express'),
    crypto    = require('crypto');

exports.setup = function(app) {
  app.use(express.bodyParser());
  app.engine('jade', require('jade').__express);

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

  // new article: all new article should have a random id before it got an id
  // to maintain the status.
  var newCreatingArticle = {};

  function redirectToNewWithRandomId(req, resp) {
    crypto.randomBytes(64, function(err, buf) {
      if (err) {
        console.log('Error redirecting new article to random: ' + err);
        respUtils.responseError(resp, 500);
      } else {
        var rndString = buf.toString('hex');
        if (rndString in newCreatingArticle) {
          // If the random id is used, generate a new one.
          redirectToNewWithRandomId(req, resp);
        } else {
          newCreatingArticle[rndString] = {};
          resp.statusCode = 302;
          resp.setHeader("Location", "/new/" + rndString);
          resp.end();
        }
      }
    });
  }

  app.get(/^\/new$/, function(req, resp) {
    // Should redirect to /new/random_token.
    redirectToNewWithRandomId(req, resp);
  });

  app.get(/^\/new\/([0-9a-f]+)$/, function(req, resp) {
    var id = req.params[0];
    if (id in newCreatingArticle) {
      resp.end("found");
    } else {
      resp.end("not found");
    }
  });
}
