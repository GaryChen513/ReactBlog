const Topic = require("../models/topic");

class TopicCtl {
  findAll(req, res) {
    Topic
      .find(req.query)
      .then((data) => res.json(data))
      .catch((err) => res.status(422).json(err))
  }
  
}

module.exports = new TopicCtl();
