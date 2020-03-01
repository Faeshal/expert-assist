const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getRegister = (req, res, next) => {
  res.render("register", {
    path: "/register"
  });
};

exports.postRegister = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const level = req.body.level;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        res.redirect("/register");
      }
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        level: level
      });
      return user.save();
    })
    .then(result => {
      res.redirect("/login");
    })
    .catch(err => {
      console.log(err);
    });
};
