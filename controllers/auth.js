const User = require("../models/User");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

exports.getRegister = (req, res, next) => {
  res.render("front/register", {
    path: "front/register"
  });
};

exports.postRegister = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  const level = req.body.level;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        res.redirect("/register");
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            username: username,
            level: level
          });
          return user.save();
        })
        .then(result => {
          res.redirect("/login");
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getLogin = (req, res, next) => {
  res.render("front/login");
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            // req.body.auth = req.auth.id;
            return req.session.save(err => {
              console.log(err);
              if (user.level == "mentor") {
                res.redirect("/mentor/dashboard");
              } else if (user.level == "user") {
                res.redirect("/user/dashboard");
              }
            });
          }
          res.redirect("/login");
        })
        .catch(err => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch(err => console.log(err));
};

exports.getRegisterAdmin = (req, res, next) => {
  res.render("front/registerAdmin", {
    path: "front/registerAdmin"
  });
};

exports.postRegisterAdmin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const level = req.body.level;
  const securityCode = req.body.securityCode;
  if (securityCode !== "1997") {
    res.redirect("/register");
  } else if (securityCode == "1997") {
    Admin.findOne({ email: email })
      .then(adminDoc => {
        if (adminDoc) {
          res.redirect("/register");
        }
        return bcrypt
          .hash(password, 12)
          .then(hashedPassword => {
            const admin = new Admin({
              email: email,
              password: hashedPassword,
              level: level
            });
            return admin.save();
          })
          .then(result => {
            res.redirect("/loginAdmin");
          });
      })
      .catch(err => {
        console.log(err);
      });
  }
};

exports.getLoginAdmin = (req, res, next) => {
  res.render("front/loginAdmin");
};

exports.postLoginAdmin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Admin.findOne({ email: email })
    .then(admin => {
      if (!admin) {
        return res.redirect("/loginAdmin");
      }
      console.log(admin);
      bcrypt
        .compare(password, admin.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.admin = admin;
            return req.session.save(err => {
              console.log(err);
              res.redirect("/admin/dashboard");
            });
          }
          res.redirect("/loginAdmin");
        })
        .catch(err => {
          console.log(err);
          res.redirect("/loginAdmin");
        });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};
