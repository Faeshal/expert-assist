require("pretty-error").start();
require("dotenv").config();
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Mentor = require("../models/Mentor");
const bcrypt = require("bcryptjs");
const chalk = require("chalk");
const routeCache = require("route-cache");
const voca = require("voca");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getRegister = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("front/register", {
    pageTitle: "Register",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postRegister = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = voca.capitalize(req.body.username);
  const level = req.body.level;

  // *Express Validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("front/register", {
      pageTitle: "Register",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        username: username,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  if (level == "user") {
    User.findOne({ $or: [{ email: email }, { username: username }] })
      .then((userDoc) => {
        if (userDoc) {
          req.flash(
            "error",
            "E-Mail / Username already exist, please pick a different one."
          );
          res.redirect("/register");
        } else {
          return bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
              const user = new User({
                email: email,
                password: hashedPassword,
                username: username,
                level: level,
              });
              return user.save();
            })
            .then((result) => {
              const msg = {
                to: email,
                from: "expertassist@example.com",
                subject: "Sucessfully Register",
                text: "Congratulation & Welcome to the Club",
                html: "<strong>Congratulation & Welcome to the Club</strong>",
              };
              sgMail.send(msg);
              res.redirect("/login");
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (level == "mentor") {
    Mentor.findOne({ $or: [{ email: email }, { username: username }] })
      .then((mentorDoc) => {
        if (mentorDoc) {
          req.flash(
            "error",
            "E-Mail / Username already exist, please pick a different one."
          );
          res.redirect("/register");
        } else {
          return bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
              const mentor = new Mentor({
                email: email,
                password: hashedPassword,
                username: username,
                level: level,
              });
              return mentor.save();
            })
            .then((result) => {
              res.redirect("/login");
              const msg = {
                to: email,
                from: "expertassist@example.com",
                subject: "Sucessfully Register",
                text: "Congratulation & Welcome to the Club",
                html: "<strong>Congratulation & Welcome to the Club</strong>",
              };
              return sgMail.send(msg);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("front/login", {
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const level = req.body.level;
  // *Express Validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("front/login", {
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }
  if (level == "user") {
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(422).render("front/login", {
            pageTitle: "login",
            errorMessage: "Invalid email or password",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        }
        bcrypt
          .compare(password, user.password)
          .then((doMatch) => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save((err) => {
                console.log(err);
                res.redirect("/user/dashboard");
              });
            }
            return res.status(422).render("front/login", {
              pageTitle: "login",
              errorMessage: "Invalid email or password",
              oldInput: {
                email: email,
                password: password,
              },
              validationErrors: [],
            });
          })
          .catch((err) => {
            console.log(err);
            res.redirect("/login");
          });
      })
      .catch((err) => console.log(err));
  } else if (level == "mentor") {
    Mentor.findOne({ email: email })
      .then((mentor) => {
        if (!mentor) {
          return res.status(422).render("front/login", {
            pageTitle: "login",
            errorMessage: "Invalid email or password",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        }
        bcrypt
          .compare(password, mentor.password)
          .then((doMatch) => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.mentor = mentor;
              return req.session.save((err) => {
                console.log(err);
                res.redirect("/mentor/dashboard");
              });
            }
            return res.status(422).render("front/login", {
              pageTitle: "login",
              errorMessage: "Invalid email or password",
              oldInput: {
                email: email,
                password: password,
              },
              validationErrors: [],
            });
          })
          .catch((err) => {
            console.log(err);
            res.redirect("/login");
          });
      })
      .catch((err) => console.log(err));
  }
};

exports.getRegisterAdmin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("front/registerAdmin", {
    path: "front/registerAdmin",
    errorMessage: message,
    pageTitle: "Register Admin",
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
      .then((adminDoc) => {
        if (adminDoc) {
          req.flash(
            "error",
            "E-Mail exists already, please pick a different one."
          );
          return res.redirect("/registerAdmin");
        }
        return bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            const admin = new Admin({
              email: email,
              password: hashedPassword,
              level: level,
            });
            return admin.save();
          })
          .then((result) => {
            res.redirect("/loginAdmin");
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getLoginAdmin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("front/loginAdmin", {
    errorMessage: message,
    pageTitle: "Login",
  });
};

exports.postLoginAdmin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Admin.findOne({ email: email })
    .then((admin) => {
      if (!admin) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/loginAdmin");
      }
      bcrypt
        .compare(password, admin.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.admin = admin;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/admin/dashboard");
            });
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/loginAdmin");
        })
        .catch((err) => {
          console.log(err);
          routeCache.removeCache("/");
          res.redirect("/loginAdmin");
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    routeCache.removeCache("/");
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("front/reset", {
    errorMessage: message,
    pageTitle: "Reset Password",
  });
};

exports.postReset = (req, res, next) => {
  const level = req.body.level;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    if (level == "user") {
      User.findOne({ email: req.body.email })
        .then((user) => {
          if (!user) {
            req.flash("error", "No account with that email found.");
            return res.redirect("/reset");
          }
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();
        })
        .then((result) => {
          res.redirect("/");
          const msg = {
            to: req.body.email,
            from: "expertassist@example.com",
            subject: "Password reset",
            text: "Congratulation & Welcome to the Club",
            html: ` <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>`,
          };
          return sgMail.send(msg);
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (level == "mentor") {
      Mentor.findOne({ email: req.body.email })
        .then((mentor) => {
          if (!mentor) {
            req.flash("error", "No account with that email found.");
            return res.redirect("/reset");
          }
          mentor.resetToken = token;
          mentor.resetTokenExpiration = Date.now() + 3600000;
          return mentor.save();
        })
        .then((result) => {
          res.redirect("/");
          const msg = {
            to: req.body.email,
            from: "expertassist@example.com",
            subject: "Password reset",
            text: "Congratulation & Welcome to the Club",
            html: ` <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>`,
          };
          return sgMail.send(msg);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (user === null) {
        Mentor.findOne({
          resetToken: token,
          resetTokenExpiration: { $gt: Date.now() },
        }).then((mentor) => {
          let message = req.flash("error");
          if (message.length > 0) {
            message = message[0];
          } else {
            message = null;
          }
          res.render("front/newPassword", {
            errorMessage: message,
            userId: mentor._id.toString(),
            passwordToken: token,
            pageTitle: "Reset Password",
          });
        });
      } else {
        let message = req.flash("error");
        if (message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render("front/newPassword", {
          errorMessage: message,
          userId: user._id.toString(),
          passwordToken: token,
          pageTitle: "Reset Password",
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (user === null) {
        Mentor.findOne({
          resetToken: passwordToken,
          resetTokenExpiration: { $gt: Date.now() },
          _id: userId,
        })
          .then((mentor) => {
            resetUser = mentor;
            return bcrypt.hash(newPassword, 12);
          })
          .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
          })
          .then((result) => {
            res.redirect("/login");
          });
      } else if (user !== null) {
        resetUser = user;
        return bcrypt
          .hash(newPassword, 12)
          .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
          })
          .then((result) => {
            res.redirect("/login");
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
