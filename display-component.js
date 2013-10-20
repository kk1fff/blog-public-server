var db = require('./db.js'),
    express = require('express');

exports.setup = function(app) {
  app.use(express['static'](__dirname + '/pages'));
  app.use(express.bodyParser());
  app.engine('jade', require('jade').__express);
  function renderPostListWithRange(base, req, resp) {
    resp.setHeader('Content-Type', 'text/html');
    db.getArticlesWithLimit('date', true, base, 10)
      .then(function(articles) {
        app.render('posts.jade', { articles: articles }, function(err, html) {
          if (!err) {
            resp.end(html);
          } else {
            console.log("Error when rendering: " + err);
          }
        });
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
};
