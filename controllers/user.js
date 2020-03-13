const User = require("../models/User");

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
  const profilePicture = req.body.profilePicture;
  const job = req.body.job;
  const bio = req.body.bio;
  const address = req.body.address;
  const phone = req.body.phone;
  const twitter = req.body.twitter;
  const github = req.body.github;
  const linkedin = req.body.linkedin;

  User.findOne({ _id: id })
    .then(user => {
      user.username = username;
      user.profilePicture = profilePicture;
      user.job = job;
      user.bio = bio;
      user.address = address;
      user.phone = phone;
      user.twitter = twitter;
      user.github = github;
      user.linkedin = linkedin;

      return user.save();
    })
    .then(result => {
      console.log("Profile Updated");
      res.redirect("/user/profile");
    })
    .catch(err => console.log(err));
};
