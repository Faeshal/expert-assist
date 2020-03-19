const Mentor = require("../models/Mentor");
const Admin = require("../models/Admin");
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
  const profilepicture = req.files["profilepicture"];
  const coverpicture = req.files["coverpicture"];

  console.log("*********************");
  console.log(req.files["profilepicture"]);
  console.log("================");
  console.log(req.files["coverpicture"]);
  console.log("================");
  console.log(req.files);
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

exports.getExam = (req, res, next) => {
  console.log(req.session.mentor);
  Admin.findOne({ level: "admin" })
    .then(admin => {
      console.log(admin.category[0].name);
      if (!admin) {
        console.log("Admin not found");
        res.render("layouts/500");
      } else {
        Mentor.findById(req.session.mentor)
          .then(mentor => {
            res.render("back/mentor/exam", {
              mentor: mentor,
              admin: admin
            });
          })
          .catch(err => console.log(err));
      }
    })
    .catch();
};

exports.postExam = (req, res, next) => {
  const expertise = req.body.expertise;
  const examstatus = req.body.examstatus;
  const id = req.session.mentor._id;
  Mentor.findById(id)
    .then(mentor => {
      mentor.expertise = expertise;
      mentor.examstatus = examstatus;
      return mentor.save();
    })
    .then(result => {
      res.redirect("/mentor/exam/begin");
    })
    .catch(err => console.log(err));
};

exports.getBeginExam = (req, res, next) => {
  Admin.findOne({ level: "admin" }).then(admin => {
    if (!admin) {
      console.log("Admin not found");
    } else {
      Mentor.findById(req.session.mentor._id)
        .then(mentor => {
          console.log(req.session.mentor);
          console.log("------");
          // * Compare
          if (!mentor.expertise) {
            res.redirect("/mentor/dashboard");
            console.log("Not Auhtorize");
          } else {
            let testlink;
            if (mentor.expertise == admin.category[0].name) {
              testlink = admin.category[0].testlink;
            } else if (mentor.expertise == admin.category[1].name) {
              testlink = admin.category[1].testlink;
            } else if (mentor.expertise == admin.category[2].name) {
              testlink = admin.category[2].testlink;
            }
            res.render("back/mentor/begin", {
              mentor: mentor,
              admin: admin,
              testlink: testlink
            });
          }
        })
        .catch(err => console.log(err));
    }
  });
};
