const router = require("express").Router();
const articleRoutes = require("./articles");
const topicRoutes = require("./topics");

// Book routes
router.use("/articles", articleRoutes);
router.use("/topics", topicRoutes);

module.exports = router;
