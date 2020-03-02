const Auth = require("../models/Auth");
const bcrypt = require("bcryptjs");

exports.getRegister = (req, res, next) => {
  res.render("front/register", {
    path: "front/register"
  });
};

exports.postRegister = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const level = req.body.level;
  Auth.findOne({ email: email })
    .then(authDoc => {
      if (authDoc) {
        res.redirect("/register");
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const auth = new Auth({
            email: email,
            password: hashedPassword,
            level: level
          });
          return auth.save();
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
  Auth.findOne({ email: email })
    .then(auth => {
      if (!auth) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, auth.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.auth = auth;
            // req.body.auth = req.auth.id;
            return req.session.save(err => {
              console.log(err);
              if (auth.level == "admin") {
                res.redirect("/admin/dashboard");
              } else if (auth.level == "user") {
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
    Auth.findOne({ email: email })
      .then(authDoc => {
        if (authDoc) {
          res.redirect("/register");
        }
        return bcrypt
          .hash(password, 12)
          .then(hashedPassword => {
            const auth = new Auth({
              email: email,
              password: hashedPassword,
              level: level
            });
            return auth.save();
          })
          .then(result => {
            res.redirect("/login");
          });
      })
      .catch(err => {
        console.log(err);
      });
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};
