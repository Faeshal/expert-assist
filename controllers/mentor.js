const Mentor = require("../models/Mentor");
const Admin = require("../models/Admin");
const Review = require("../models/Review");
const Payment = require("../models/Payment");
const Schedule = require("../models/Schedule");
const Withdraw = require("../models/Withdraw");
const fileHelper = require("../util/file");
const moment = require("moment");
const currency = require("currency.js");
const axios = require("axios");
const chalk = require("chalk");
const bcrypt = require("bcryptjs");
const voca = require("voca");
const { validationResult } = require("express-validator");

exports.getDashboard = (req, res, next) => {
  const id = req.session.mentor._id;

  Mentor.findOne({ _id: id })
    .then((mentor) => {
      res.render("back/mentor/dashboard", {
        mentor: mentor,
        currency: currency,
      });
    })
    .catch((err) => console.log(err));
};

exports.postMentorStatus = (req, res, next) => {
  const mentorstatus = req.body.mentorstatus;
  const mentorUsername = req.session.mentor.username;

  let data = {
    name: mentorUsername,
    privacy: "public",
  };
  axios
    .post("https://api.daily.co/v1/rooms", data, {
      headers: {
        Authorization:
          "Bearer 6535fe7995967cb3772d206bdc68f43f0e02d3d512243745c1cb747987b06c13",
      },
    })
    .then(function (response) {
      console.log(chalk.yellow.inverse(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  Mentor.findById(req.session.mentor._id)
    .then((mentor) => {
      mentor.mentorstatus = mentorstatus;
      return mentor.save().then((result) => {
        res.redirect("/mentor/profile");
      });
    })
    .catch((err) => console.log(err));
};

exports.getProfile = (req, res, next) => {
  Mentor.findById(req.session.mentor._id)
    .then((mentor) => {
      res.render("back/mentor/profile", {
        mentor: mentor,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getPayment = (req, res, next) => {
  const id = req.session.mentor._id;
  Payment.find({ $and: [{ mentor: id }, { status: true }] })
    .populate("user", "username email")
    .then((payment) => {
      console.log(chalk.greenBright.inverse(payment));
      Mentor.findById(id).then((mentor) => {
        res.render("back/mentor/payment", {
          mentor: mentor,
          payment: payment,
          voca: voca,
          moment: moment,
          currency: currency,
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.getUpdateProfile = (req, res, next) => {
  Mentor.findById(req.session.mentor._id)
    .then((mentor) => {
      res.render("back/mentor/profileUpdate", {
        mentor: mentor,
      });
    })
    .catch((err) => console.log(err));
};

exports.updateProfile = (req, res, next) => {
  const id = req.body.id;
  const username = req.body.username;
  const price = req.body.price;
  const city = req.body.city;
  const job = req.body.job;
  const phone = req.body.phone;
  const cv = req.body.cv;
  const desc = req.body.desc;
  const bio = req.body.bio;
  const portofolio = req.body.portofolio;
  const experience = req.body.experience;
  const twitter = req.body.twitter;
  const github = req.body.github;
  const linkedin = req.body.linkedin;
  const profilepicture = req.files["profilepicture"];
  const coverpicture = req.files["coverpicture"];

  console.log("*********************");
  console.log(req.files["profilepicture"]);
  console.log("================");
  console.log(req.files["coverpicture"]);
  console.log("================");
  console.log(req.files);
  Mentor.findOne({ _id: id })
    .then((mentor) => {
      mentor.username = username;
      mentor.price = price;
      mentor.city = city;
      mentor.job = job;

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

      mentor.phone = phone;
      mentor.twitter = twitter;
      mentor.github = github;
      mentor.linkedin = linkedin;
      mentor.experience = experience;
      mentor.portofolio = portofolio;
      mentor.cv = cv;
      mentor.bio = bio;
      mentor.desc = desc;

      console.log(mentor.coverpicture);

      return mentor.save();
    })
    .then((result) => {
      console.log(result);
      console.log("Profile Updated");
      res.redirect("/mentor/profile");
    })
    .catch((err) => console.log(err));
};

exports.getExam = (req, res, next) => {
  console.log(req.session.mentor);
  Admin.findOne({ level: "admin" })
    .then((admin) => {
      // ! Bug - Handle eror , kalau category exam belum di set admin
      console.log(admin.category[0].name);

      if (!admin) {
        console.log("Admin not found");
        res.render("layouts/500");
      } else {
        Mentor.findById(req.session.mentor._id)
          .then((mentor) => {
            res.render("back/mentor/exam", {
              mentor: mentor,
              admin: admin,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postExam = (req, res, next) => {
  const expertise = req.body.expertise;
  const id = req.session.mentor._id;
  Mentor.findById(id)
    .then((mentor) => {
      mentor.expertise = expertise;
      return mentor.save();
    })
    .then((result) => {
      res.redirect("/mentor/exam/begin");
    })
    .catch((err) => console.log(err));
};

exports.postBeginExam = (req, res, next) => {
  const examstatus = req.body.examstatus;
  Mentor.findById(req.session.mentor._id)
    .then((mentor) => {
      mentor.examstatus = examstatus;
      return mentor.save();
    })
    .catch((err) => console.log(err));
};

exports.getBeginExam = (req, res, next) => {
  Admin.findOne({ level: "admin" }).then((admin) => {
    if (!admin) {
      console.log("Admin not found");
    } else {
      Mentor.findById(req.session.mentor._id)
        .then((mentor) => {
          console.log(req.session.mentor);
          console.log("------");
          // * Compare
          if (!mentor.expertise) {
            res.render("layouts/404");
            console.log("Not Auhtorize");
          } else if (mentor.examstatus == true) {
            res.redirect("/mentor/dashboard");
            console.log("Exam Finished");
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
              testlink: testlink,
            });
          }
        })
        .catch((err) => console.log(err));
    }
  });
};

exports.getSchedule = (req, res, next) => {
  const id = req.session.mentor._id;
  Schedule.find({ mentor: id })
    .populate({ path: "user", select: ["username", "email"] })
    .then((schedule) => {
      console.log(schedule);
      Mentor.findById(id).then((mentor) => {
        res.render("back/mentor/schedule", {
          mentor: mentor,
          schedule: schedule,
          moment: moment,
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.postDeleteSchedule = (req, res, next) => {
  const id = req.body.id;
  Schedule.findByIdAndDelete(id)
    .then((result) => {
      console.log(result);
      res.redirect("/mentor/schedule");
    })
    .catch((er) => console.log(err));
};

exports.postUpdateSchedule = (req, res, next) => {
  const id = req.body.id;
  const approve = req.body.approve;
  const link = req.body.link;

  Schedule.findById(id)
    .then((schedule) => {
      schedule.approve = approve;
      schedule.link = link;
      return schedule.save();
    })
    .then((result) => {
      console.log(result);
      res.redirect("/mentor/schedule");
    })
    .catch((err) => console.log(err));
};

exports.getMentoring = (req, res, next) => {
  const id = req.session.mentor._id;
  Schedule.findOne({ mentor: id })
    .then((schedule) => {
      if (!schedule) {
        console.log("No User Found");
      }
      console.log(schedule);
      res.render("back/mentor/mentoring", {
        schedule: schedule,
        mentor: req.session.mentor._id,
      });
    })
    .catch((err) => console.log(err));
};

exports.getLive = (req, res, next) => {
  const id = req.session.mentor._id;
  Schedule.findOne({ mentor: id })
    .then((schedule) => {
      console.log(schedule);
      if (schedule.approve == false) {
        res.render("layouts/404");
        console.log("Not Auhtorize");
      } else if (schedule.approve == true) {
        res.render("back/mentor/live", {
          schedule: schedule,
          mentor: req.session.mentor._id,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.getReview = (req, res, next) => {
  const id = req.session.mentor._id;

  Review.find({ mentor: id })
    .sort({ _id: -1 })
    .populate("user", "username")
    .exec()
    .then((review) => {
      console.log(chalk.blueBright(review));
      console.log(review.user);
      Schedule.findOne({
        $and: [{ mentor: req.session.mentor._id }, { approve: true }],
      })
        .then((schedule) => {
          Mentor.findById(id).then((mentor) => {
            res.render("back/mentor/review", {
              mentor: mentor,
              review: review,
              moment: moment,
              voca: voca,
              schedule: schedule,
            });
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getWithdraw = (req, res, next) => {
  const id = req.session.mentor._id;

  Mentor.findById(id)
    .then((mentor) => {
      if (!mentor) {
        console.log("No Mentor");
      } else if (mentor) {
        console.log(chalk.yellow(mentor));
        Payment.findOne({ mentor: id })
          .then((payment) => {
            console.log(chalk.blue(payment));
            Withdraw.find({ mentor: id })
              .sort({ _id: -1 })
              .then((withdraw) => {
                if (!withdraw) {
                  console.log(chalk.grey("No Withdraw Found"));
                } else if (withdraw) {
                  console.log(chalk.cyanBright(withdraw));
                  res.render("back/mentor/withdraw", {
                    moment: moment,
                    voca: voca,
                    mentor: mentor,
                    payment: payment,
                    withdraw: withdraw,
                    currency: currency,
                  });
                }
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

exports.postWithdraw = (req, res, next) => {
  const mentor = req.body.mentor;
  const total = req.body.total;
  const note = req.body.note;
  const initialincome = req.body.initialincome;

  const tax = 0.05;

  const adminIncome = total * tax;
  const finalTotal = total - adminIncome;

  const withdraw = new Withdraw({
    initialincome: initialincome,
    mentor: mentor,
    total: finalTotal,
    note: note,
    adminincome: adminIncome,
  });
  withdraw
    .save()
    .then((result) => {
      console.log(chalk.yellow.inverse(result));
      res.redirect("/mentor/withdraw");
    })
    .catch((err) => console.log(err));
};

exports.deleteWithdraw = (req, res, next) => {
  const id = req.body.id;
  Withdraw.findByIdAndDelete(id)
    .then((withdraw) => {
      console.log(chalk.yellow.inverse(withdraw));
      res.redirect("/mentor/withdraw");
    })
    .catch((err) => console.log(err));
};

exports.postChangePassword = (req, res, next) => {
  const id = req.body.id;
  const password = req.body.password;
  const newPassword = req.body.newPassword;

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).jsonp(errors.array());
  } else {
    console.log(chalk.green.inverse("lulus uji express-validator"));
  }

  Mentor.findById(id)
    .then((mentor) => {
      const oldPassword = mentor.password;
      bcrypt.compare(password, oldPassword).then((doMatch) => {
        if (doMatch) {
          return bcrypt.hash(newPassword, 12).then((hashedPassword) => {
            Mentor.findById(id)
              .then((mentors) => {
                mentors.password = hashedPassword;
                return mentors.save().then((result, err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.json(result);
                    console.log(chalk.yellowBright(result));
                  }
                });
              })
              .catch((err) => console.log(err));
          });
        } else {
          console.log(chalk.redBright("password not match"));
          res.status(422).json({ error: "password not match" });
        }
      });
    })
    .catch((err) => console.log(err));
};
