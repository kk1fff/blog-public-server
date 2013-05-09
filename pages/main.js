function Article(contentElem) {
  this._contentElement = contentElem;
}

Article.prototype = {
  getContent: function() {
    return this._contentElement.val();
  },
  getTitle: function() {
    return "Test";
  },
  getDate: function() {
    return Date.now();
  },
  update: function() {
    var url;
    if (this._id) {
      url = '/api/post/update/' + this._id;
    } else {
      url = '/api/post/create';
    }

    $.post(url,
           { title:   this.getTitle(),
             content: this.getContent(),
             date:    this.getDate() },
           this._updateDone.bind(this),
           'json');
  },
  _updateDone: function(data) {
    if (!this._id) {
      this._id = data.id;
    }
  }
};

var article;

$(document).ready(function() {
  article = new Article($('#content'));
  $('#store').click(function() {
    article.update();
  });
});
