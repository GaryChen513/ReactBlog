const User = require("../models/user");
const bcrypt = require("bcrypt");

const validateEmail = (email) => {
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

const comparePasswords = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) return reject(err);

      return resolve(result);
    });
  });
};

class UserCtl {
  signup(req, res) {
    const {
      body: { password, email },
    } = req;

    if (email === undefined || password === undefined)
      return res.status(400).json({ error: "Missing information" });

    if (!validateEmail(email))
      return res.status(400).json({ error: "Not a valid email address" });

    if (!validateEmail(email))
      return res.status(400).json({ error: "Not a valid email address" });

    if (!validatePassword(password))
      return res
        .status(400)
        .json({ error: "Password doesn't meet requirements" });

    User.find({ email })
      .then((result) => {
        if (result.length != 0)
          return res.status(403).json({ error: "Email already Exists" });

        User.create(req.body)
          .then((user) => {
            req.session.save(() => {
              req.session.user_id = user._id;
              req.session.logged_in = true;
              req.session.role = user.role;

              res.json({ user: user, message: "You are now logged in!" });
            });
          })
          .catch((err) => res.status(500).json(err));
      })
      .catch((err) => res.status(500).json(err));
  }

  login(req, res) {
    const {
      body: { email, password },
    } = req;

    if (email === undefined || password === undefined)
      return res.status(400).json({ error: "Missing information" });

    User.findOne({ email })
      .then(async (user) => {
        if (!(await comparePasswords(password, user.password)))
          return res
            .status(400)
            .json({ error: "Incorrect username or password" });

        req.session.save(() => {
          req.session.user_id = user._id;
          req.session.logged_in = true;
          req.session.role = user.role;

          res.json({ user: user});
        });
      })
      .catch((err) => res.status(400).json(err));
  }

  getUser(req, res) {
    if (req.session === undefined)
      return res.status(400).json({ err: "Authentication error" });

    User.findOne({ _id: req.session.user_id })
      .then((user) => {
        const response = {
          _id: user._id,
          email: user.email,
          role: user.role,
        };

        res.status(200).json(response);
      })
      .catch((err) =>
        res.status(404).json({ error: "Could not get details of user" })
      );
  }

  logout(req, res) {
    if (req.session.logged_in) {
      req.session.destroy(() => {
        res.status(204).end();
      });
    } else {
      res.status(404).end();
    }
  }
}

module.exports = new UserCtl();
