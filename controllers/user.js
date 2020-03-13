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
  res.render("back/user/profile");
};

exports.createProfile = (req, res, next) => {
  const username = req.body.username;
  const profilePicture = req.body.profilePicture;
  const job = req.body.job;
  const bio = req.body.bio;
  const address = req.body.address;
  const phone = req.body.phone;
  const twitter = req.body.twitter;
  const github = req.body.github;
  const linkedin = req.body.linkedin;

  const user = new User({
    username: username,
    profilePicture: profilePicture,
    job: job,
    bio: bio,
    address: address,
    phone: phone,
    twitter: twitter,
    github: github,
    linkedin: linkedin
  });
  user
    .save()
    .then(result => {
      console.log("Created Profile");
      res.redirect("/user/profile");
    })
    .catch(err => {
      console.log(err);
    });
};
