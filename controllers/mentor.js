const Mentor = require("../models/Mentor");
const fileHelper = require("../util/file");

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
  const address = req.body.address;
  const job = req.body.job;
  const phone = req.body.phone;
  // const profilepicture = req.file;

  const profilepicture = req.files["profilepicture"][0];

  const coverpicture = req.files["coverpicture"][0];

  // console.log(req.files["coverpicture"][0].path);
  console.log("================");
  console.log(req.body);
  Mentor.findOne({ _id: id })
    .then(mentor => {
      mentor.username = username;
      mentor.address = address;
      mentor.job = job;
      mentor.phone = phone;

      if (profilepicture) {
        fileHelper.deleteFile(mentor.profilepicture);
        mentor.profilepicture = req.files["profilepicture"][0].path.replace(
          "\\",
          "/"
        );
      }

      if (coverpicture) {
        fileHelper.deleteFile(mentor.coverpicture);
        mentor.coverpicture = req.files["coverpicture"][0].path.replace(
          "\\",
          "/"
        );
      }

      console.log(mentor.coverpicture);

      return mentor.save();
    })
    .then(result => {
      console.log(result);
      console.log("Profile Updated");
      res.redirect("/mentor/profile");
    })
    .catch(err => console.log(err));
};
