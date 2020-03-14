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

exports.getProfile = (req, res, next) => {
  Mentor.findById(req.session.mentor._id)
    .then(mentor => {
      res.render("back/mentor/profile", {
        mentor: mentor
      });
    })
    .catch();
};
