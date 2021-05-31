const router = require("express").Router();
const topicCtl = require("../../controllers/topic");

const {
  findAll
} = topicCtl

router.route("/")
  .get(findAll);



module.exports = router;