const Mentor = require("../models/Mentor");

exports.getDashboard = (req, res, next) => {
  console.log(req.session);
  Mentor.findById(req.session.mentor)
    .then(mentor => {
      res.render("back/mentor/dashboard", {
        mentor: mentor
      });
    })
    .catch(err => console.log(err));
};

exports.getExam = (req, res, next) => {
  Mentor.findById(req.session.mentor)
    .then(mentor => {
      res.render("back/mentor/exam", {
        mentor: mentor
      });
    })
    .catch(err => console.log(err));
};

exports.getProfile = (req, res, next) => {
  Mentor.findById(req.session.mentor._id)
    .then(mentor => {
      res.render("back/mentor/profile", {
        mentor: mentor
      });
    })
    .catch();
};

exports.updateProfile = (req, res, next) => {
  const id = req.body.id;
  const username = req.body.username;
  const profilepicture = req.file;
  const profilepic = profilepicture.path.replace("\\", "/");
  const job = req.body.job;
  const address = req.body.address;
  const phone = req.body.phone;

  if (!profilepicture) {
    console.log("Profile Picture is empty");
  }

  Mentor.findOne({ _id: id })
    .then(mentor => {
      mentor.username = username;
      if (profilepicture) {
        mentor.profilepicture = profilepic;
      }
      mentor.job = job;
      mentor.address = address;
      mentor.phone = phone;

      return mentor.save();
    })
    .then(result => {
      console.log("Profile Updated");
      res.redirect("/mentor/profile");
    })
    .catch(err => console.log(err));
};
