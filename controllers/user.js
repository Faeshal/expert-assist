const User = require("../models/User");
const fileHelper = require("../util/file");

exports.getDashboard = (req, res, next) => {
  console.log(req.session);
  User.findById(req.session.user)
    .then(user => {
      res.render("back/user/dashboard", {
        user: user
      });
    })
    .catch(err => console.log(err));
};

exports.getProfile = (req, res, next) => {
  User.findById(req.session.user._id)
    .then(user => {
      res.render("back/user/profile", {
        user: user
      });
    })
    .catch();
};

exports.updateProfile = (req, res, next) => {
  const id = req.body.id;
  const username = req.body.username;
  const job = req.body.job;
  const bio = req.body.bio;
  const city = req.body.city;
  const phone = req.body.phone;
  const twitter = req.body.twitter;
  const github = req.body.github;
  const linkedin = req.body.linkedin;
  const profilepicture = req.file;

  User.findOne({ _id: id })
    .then(user => {
      user.username = username;
      user.job = job;
      user.bio = bio;
      user.city = city;
      user.phone = phone;
      user.twitter = twitter;
      user.github = github;
      user.linkedin = linkedin;

      if (profilepicture) {
        // fileHelper.deleteFile(mentor.profilepicture);
        user.profilepicture = profilepicture.path.replace("\\", "/");
      }

      return user.save();
    })
    .then(result => {
      console.log("Profile Updated");
      res.redirect("/user/profile");
    })
    .catch(err => console.log(err));
};
