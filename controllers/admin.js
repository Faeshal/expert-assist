const Admin = require("../models/Admin");
const User = require("../models/User");
const Auth = require("../models/Auth");

exports.getDashboard = (req, res, next) => {
  Auth.findById(req.auth.id)
    .then(auth => {
      if (!auth) {
        console.log("No Auth Data");
      }
      User.count().then(totalUser => {
        if (!totalUser) {
          console.log("No Data");
        }
        res.render("back/admin/dashboard", {
          auth: auth,
          totalUser: totalUser
        });
      });
    })
    .catch(err => console.log(err));
};

exports.getProfile = (req, res, next) => {
  res.render("back/admin/profile");
};

exports.createProfile = (req, res, next) => {
  const username = req.body.username;
  const phone = req.body.phone;
  const admin = new Admin({
    username: username,
    phone: phone
  });
  admin
    .save()
    .then(result => {
      console.log("Created Profile");
      res.redirect("/admin/profile");
    })
    .catch(err => {
      console.log(err);
    });
};
