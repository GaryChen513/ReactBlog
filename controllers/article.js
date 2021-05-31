const Article = require("../models/article");

class ArticleCtl {
  findAll(req, res) {
    Article.find(req.query)
      .sort({ createdAt: 'desc' })
      .then((data) => res.json(data))
      .catch((err) => res.status(422).json(err));
  }

  findById(req, res) {
    Article.findById(req.params.id)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => res.status(422).json(err));
  }

  create(req, res) {
    Article.create(req.body)
      .then((data) => res.json(data))
      .catch((err) => res.status(422).json(err));
  }

  update(req, res) {
    Article.findOneAndUpdate({ _id: req.params.id }, req.body)
      .then((data) => res.json(data))
      .catch((err) => res.status(422).json(err));
  }

  remove(req, res) {
    Article.findById({ _id: req.params.id })
      .then((data) => data.remove())
      .then((data) => res.json(data))
      .catch((err) => res.status(422).json(err));
  }
}

module.exports = new ArticleCtl();
