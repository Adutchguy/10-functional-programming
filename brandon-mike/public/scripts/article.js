'use strict';

(function(module){
  function Article(rawDataObj) {
    Object.keys(rawDataObj).forEach(key => this[key] = rawDataObj[key]);
  }

  Article.all = [];

  Article.prototype.toHtml = function() {
    var template = Handlebars.compile($('#article-template').text());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  Article.loadAll = rows => {
    rows.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));
    Article.all = rows.map(oneArticleRow => new Article(oneArticleRow))
  };

  Article.fetchAll = callback => {
    $.get('/articles')
    .then(
      results => {
        Article.loadAll(results);
        callback();
      }
    )
  };

  Article.numWordsAll = () =>
    Article.all.map(oneArticle => oneArticle.body.split(' ').length)
    .reduce((runningTotal, currentValue) => runningTotal + currentValue);

  Article.allAuthors = () =>
    Article.all
    .map(eachArticle => eachArticle.author)
    .reduce((arrayOfUniqueNames, currentName) => {
      if (!arrayOfUniqueNames.includes(currentName)) {
        arrayOfUniqueNames.push(currentName);
      }
      return arrayOfUniqueNames;
    }, []);

  Article.numWordsByAuthor = () => Article.allAuthors()
  .map(authorName => {
    let wordCount = Article.all.filter(article => article.author === authorName)
    .map(oneArticle => oneArticle.body.split(' ').length)
    .reduce((runningTotal, currentValue) => runningTotal + currentValue, 0);

    return {wordCount: wordCount, name: authorName};
  });

  Article.truncateTable = callback => {
    $.ajax({
      url: '/articles',
      method: 'DELETE',
    })
    .then(console.log)
    .then(callback);
  };

  Article.prototype.insertRecord = function(callback) {
    $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
    .then(console.log)
    .then(callback);
  };

  Article.prototype.deleteRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'DELETE'
    })
    .then(console.log)
    .then(callback);
  };

  Article.prototype.updateRecord = function(callback) {
    $.ajax({
      url: `/articles/${this.article_id}`,
      method: 'PUT',
      data: {
        author: this.author,
        authorUrl: this.authorUrl,
        body: this.body,
        category: this.category,
        publishedOn: this.publishedOn,
        title: this.title,
        author_id: this.author_id
      }
    })
    .then(console.log)
    .then(callback);
  };
  module.Article = Article;

}(window));
