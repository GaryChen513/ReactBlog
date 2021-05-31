const router = require("express").Router();
const { login, signup, getUser, logout } = require("../../controllers/user");

router.route("/login")
  .post(login)
  .get(isLoggedIn, getUser);

router.route("/signup")
  .post(signup);

router.route("/logout")
  .post(logout);

module.exports = router;

function isLoggedIn(req, res, next) {
  if (!req.session.logged_in) {
    res.json({});
  } else {
    next();
  }
}
