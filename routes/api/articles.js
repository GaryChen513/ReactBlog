const router = require("express").Router();
const articleCtl = require("../../controllers/article");

const {
  findAll,
  findById,
  create,
  update,
  remove
} =  articleCtl


router.route("/")
  .get(findAll)
  .post(create);

router.route("/:id")
  .get(findById)
  .put(update)
  .delete(remove);

module.exports = router;
