var Q = require('q');

function Article(initProp) {
  if (initProp) {
    this._content = initProp.content;
    this._title = initProp.title;
    this._date = initProp.date;
    this._id = initProp.id;
  }
}

Article.prototype = {
  setContent: function(content) {
    this._content = content;
  },

  getContent: function() {
    return this._content;
  },

  setTitle: function(title) {
    this._title = title;
  },

  getTitle: function() {
    return this._title;
  },

  setDate: function(date) {
    this._date = date;
  },

  getDate: function() {
    return this._date;
  },

  // ID cannot be set.
  getId: function() {
    return this._id;
  }
};

exports.Article = Article;
