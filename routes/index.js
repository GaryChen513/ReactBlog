const router = require("express").Router();
const apiRoutes = require("./api");
const homeRoutes = require("./home");
const path = require("path");

// API Routes
router.use("/api", apiRoutes);
router.use("/", homeRoutes);

router.use(function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

module.exports = router;
