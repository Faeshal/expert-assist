require("pretty-error").start();
const User = require("../models/User");
const Mentor = require("../models/Mentor");
const Payment = require("../models/Payment");
const Schedule = require("../models/Schedule");
const Review = require("../models/Review");
const fileHelper = require("../util/file");
const { validationResult } = require("express-validator");
const moment = require("moment");
const stripe = require("stripe")("sk_test_Tnz59oHlP8YD4orawQO6eUXU00FhO9PLbb");
const voca = require("voca");
const currency = require("currency.js");
const chalk = require("chalk");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

exports.getDashboard = (req, res, next) => {
  const session = req.session.user;
  User.findById(session._id)
    .then((user) => {
      Payment.countDocuments({ user: session._id }).then((totalPayment) => {
        Payment.countDocuments({
          $and: [{ user: session._id }, { approve: true }, { status: false }],
        }).then((failedPayment) => {
          Schedule.countDocuments({
            $and: [
              { user: session._id },
              { approve: "true" },
              { status: false },
            ],
          }).then((incomingSchedule) => {
            Review.countDocuments({ user: session._id }).then((totalReview) => {
              Schedule.find({
                $and: [{ user: session._id }, { approve: "false" }],
              })
                .countDocuments()
                .then((waitingSchedule) => {
                  Schedule.find({
                    $and: [{ user: session._id }, { approve: "reject" }],
                  })
                    .countDocuments()
                    .then((rejectedSchedule) => {
                      Schedule.findOne({
                        $and: [
                          { user: session._id },
                          { approve: "true" },
                          { status: false },
                        ],
                      })
                        .sort({ datetime: 1 })
                        .then((nextMentoring) => {
                          Schedule.find({
                            $and: [
                              { user: session._id },
                              { approve: "true" },
                              { status: true },
                            ],
                          })
                            .countDocuments()
                            .then((finishedMentoring) => {
                              res.render("back/user/dashboard", {
                                user: user,
                                session: session,
                                moment: moment,
                                totalPayment: totalPayment,
                                failedPayment: failedPayment,
                                incomingSchedule: incomingSchedule,
                                totalReview: totalReview,
                                waitingSchedule: waitingSchedule,
                                rejectedSchedule: rejectedSchedule,
                                nextMentoring: nextMentoring,
                                finishedMentoring: finishedMentoring,
                              });
                            });
                        });
                    });
                });
            });
          });
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.getProfile = (req, res, next) => {
  const session = req.session.user;
  User.findById(session._id)
    .then((user) => {
      res.render("back/user/profile", {
        user: user,
        session: session,
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
    .then((user) => {
      user.username = username;
      user.job = job;
      user.bio = bio;
      user.city = city;
      user.phone = phone;
      user.twitter = twitter;
      user.github = github;
      user.linkedin = linkedin;

      if (profilepicture) {
        fileHelper.deleteFile(user.profilepicture);
        user.profilepicture = profilepicture.path.replace("\\", "/");
      }

      return user.save();
    })
    .then((result) => {
      console.log("Profile Updated");
      res.redirect("/user/profile");
    })
    .catch((err) => console.log(err));
};

exports.postPayment = (req, res, next) => {
  const user = req.body.user;
  const mentor = req.body.mentor;
  const price = req.body.price;
  const duration = req.body.duration;
  const total = price * duration;

  const payment = new Payment({
    user: user,
    mentor: mentor,
    price: price,
    total: total,
    duration: duration,
  });
  return payment
    .save()
    .then((result) => {
      console.log(chalk.yellow.inverse(result));
      res.redirect("/stripe/" + payment._id);
    })
    .catch((err) => console.log(err));
};

exports.getStripe = (req, res, next) => {
  const id = req.params.id;
  Payment.findById(id)
    .then((payment) => {
      console.log(chalk.blueBright.inverse(payment));
      const price = payment.price;
      const priceConvert = price * 100;
      const duration = payment.duration;

      // *Stripe
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            name: "Mentor Payment",
            description: "Expert-Assist Payment System",
            images: [
              "https://cdn2.iconfinder.com/data/icons/money-related/128/MONEY_2-02-512.png",
            ],
            amount: priceConvert,
            currency: "idr",
            quantity: duration,
          },
        ],
        success_url:
          req.protocol + "://" + req.get("host") + "/payment/success/" + id,
        cancel_url:
          req.protocol + "://" + req.get("host") + "/payment/cancel/" + id,
      });
    })
    .then((session) => {
      console.log(session.id);
      res.render("front/stripe", {
        sessionId: session.id,
      });
    })
    .catch((err) => console.log(err));
};

exports.postStripeSuccess = (req, res, next) => {
  const id = req.params.id;
  console.log(chalk.red.inverse(`Payment ID : ${id}`));
  Payment.findById(id)
    .then((payment) => {
      payment.status = true;
      return payment
        .save()
        .then((result) => {
          console.log(chalk.red(result));
          Payment.findOne()
            .sort({ _id: -1 })
            .then((payment) => {
              const mentorId = payment.mentor;
              console.log(chalk.red.inverse(`Mentor ID : ${mentorId}`));
              // ** get the last payment
              Payment.findOne({ mentor: mentorId })
                .sort({ _id: -1 })
                .limit(1)
                .then((payment) => {
                  userId = payment.user;
                  // console.log(chalk.yellowBright.inverse(payment));
                  let total = payment.total;
                  // console.log("-----------------");
                  Mentor.findById(mentorId)
                    .then((mentor) => {
                      // ** sum the last payment with intial income from mentor collection
                      console.log(chalk.red.inverse(mentor));
                      let income = mentor.income + total;
                      mentor.income = income;
                      return mentor.save();
                    })
                    .then((mentorIncome) => {
                      console.log(chalk.red.inverse(mentorIncome));
                      res.redirect("/user/schedule");
                    })
                    .catch((err) => console.log(err));
                })
                .catch((err) => console.log(err));
            });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postStripeCancel = (req, res, next) => {
  const id = req.params.id;
  Payment.findByIdAndDelete(id)
    .then((result) => {
      console.log(chalk.red.inverse(`Deleted : ${result}`));
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.getSchedule = (req, res, next) => {
  const session = req.session.user;
  let lastSchedule = "";
  Payment.findOne({ user: session._id })
    .sort({ _id: -1 })
    .populate("user", "username")
    .populate("mentor", "username")
    .exec()
    .then((payment) => {
      Schedule.find({ user: session._id })
        .sort({ _id: -1 })
        .populate("mentor", "username")
        .exec()
        .then((schedule) => {
          Schedule.findOne({ user: session._id })
            .sort({ _id: -1 })
            .then((lastWaitingMentorData) => {
              console.log(chalk.magenta(lastWaitingMentorData));
              let approveStatus;
              let lastMentor = payment.mentor;
              let lastWaitingMentor = lastWaitingMentorData.mentor;
              if (lastMentor == lastWaitingMentor) {
                if (schedule.length > 0) {
                  approveStatus = "false";
                }
              }
              Schedule.findOne({
                $and: [{ user: session._id }, { approve: "reject" }],
              })
                .populate("mentor", "username")
                .then((rejectSchedule) => {
                  let userId;
                  let mentorId;
                  let duration;
                  let mentorUsername;
                  if (rejectSchedule !== null) {
                    userId = rejectSchedule.user;
                    mentorId = rejectSchedule.mentor._id;
                    duration = rejectSchedule.duration;
                    mentorUsername = rejectSchedule.mentor.username;
                  }
                  console.log(chalk.yellow.inverse(rejectSchedule));
                  res.render("back/user/schedule", {
                    payment: payment,
                    schedule: schedule,
                    moment: moment,
                    session: session,
                    approveStatus: approveStatus,
                    rejectSchedule: rejectSchedule,
                    userId: userId,
                    mentorId: mentorId,
                    duration: duration,
                    mentorUsername: mentorUsername,
                  });
                });
            });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getScheduleJson = (req, res, next) => {
  const session = req.session.user;
  Schedule.find({ $and: [{ user: session._id }, { approve: true }] })
    .countDocuments()
    .then((schedule) => {
      if (schedule) {
        res.status(200).json({ message: "Success", schedule: schedule });
      } else {
        res.json({ message: "Data Not Found", schedule: 0 });
      }
    })
    .catch((err) => console.log(err));
};

exports.postSchedule = (req, res, next) => {
  const user = req.body.user;
  const mentor = req.body.mentor;
  const duration = req.body.duration;
  const datetime = req.body.datetime;
  const note = req.body.note;
  // ** Check Jadwal Sudah ada yang booking belum
  Schedule.findOne({
    $and: [{ mentor: mentor }, { approve: "true" }, { datetime: datetime }],
  })
    .then((isEqual) => {
      console.log(isEqual);
      if (isEqual) {
        console.log(chalk.red.inverse("JADWAL SUDAH DI PESAN"));
        return res.json({ message: false });
      }
      // ** Check ada ga jadwal yang di reject sebelumnya
      Schedule.findOne({
        $and: [{ user: user }, { mentor: mentor }, { approve: "reject" }],
      }).then((lastReject) => {
        if (lastReject) {
          Schedule.findByIdAndDelete(lastReject._id).then((del) => {
            console.log(chalk.red.inverse(del));
          });
        }
        // ** Kalau udah lolos semua , baru proses save
        const schedule = new Schedule({
          user: user,
          mentor: mentor,
          duration: duration,
          datetime: datetime,
          note: note,
        });
        return schedule.save().then((result) => {
          console.log(chalk.yellow.inverse(result));
          res.json({ message: true });
        });
      });
    })
    .catch((err) => console.log(err));
};

exports.psotEditSchedule = (req, res, next) => {
  const id = req.body.id;
  const datetime = req.body.datetime;
  Schedule.findByIdAndUpdate(id).then((schedule) => {
    schedule.datetime = datetime;
    return schedule.save().then((result) => {
      console.log(chalk.green.inverse(result));
      res.redirect("/user/schedule");
    });
  });
};

exports.getMentoring = (req, res, next) => {
  const session = req.session.user;
  const dateTimeNow = new Date();

  Payment.findOne({ user: session._id })
    .then((payment) => {
      if (!payment) {
        console.log("User Not Yet Pay");
      }
      Schedule.findOne({
        $and: [{ user: session._id }, { approve: "true" }, { status: false }],
      })
        .sort({ datetime: 1 })
        .populate("mentor", "username")
        .then((schedule) => {
          console.log(chalk.green.inverse(schedule));
          let dateTimeSchedule = "";
          if (schedule) {
            dateTimeSchedule = schedule.datetime;
          } else {
            schedule = 0;
          }

          var now = moment().format();
          var finish = moment(dateTimeSchedule).format();

          let newdate = new Date();
          let hasil = Math.abs(dateTimeSchedule - newdate);
          let incoming = moment.utc(hasil).format("LTS");

          console.log(toString);
          console.log(incoming);
          console.log(chalk.magenta.inverse(newdate));
          console.log(chalk.magenta.inverse(dateTimeSchedule));

          res.render("back/user/mentoring", {
            payment: payment,
            schedule: schedule,
            session: session,
            dateTimeNow: dateTimeNow,
            dateTimeSchedule: dateTimeSchedule,
            moment: moment,
            now: now,
            incoming: incoming,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getLive = (req, res, next) => {
  const id = req.session.user._id;
  Schedule.findOne({ user: id })
    .sort({ datetime: -1 })
    .then((schedule) => {
      const dateTimeSchedule = schedule.datetime;
      console.log(chalk.red.inverse(schedule));
      console.log("MASUK");
      if (schedule.approve == "false" || schedule.approve == "reject") {
        res.render("layouts/404");
        console.log("Not Auhtorize");
      } else if (schedule.approve == "true") {
        res.render("back/user/live", {
          schedule: schedule,
          user: req.session.user._id,
          dateTimeSchedule: dateTimeSchedule,
          moment: moment,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.getReview = (req, res, next) => {
  const session = req.session.user;

  Review.find({ user: session._id })
    .populate("mentor", "username")
    .sort({ _id: -1 })
    .exec()
    .then((review) => {
      Schedule.findOne({ $and: [{ user: session._id }, { status: true }] })
        .sort({ _id: -1 })
        .then((schedule) => {
          if (!schedule) {
            schedule = 0;
            console.log(chalk.redBright.inverse("Ga punya jadwal"));
          } else {
            console.log("punya jadwal");
          }
          res.render("back/user/review", {
            session: session,
            review: review,
            moment: moment,
            voca: voca,
            schedule: schedule,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postReview = (req, res, next) => {
  const id = req.body.id;
  const content = req.body.content;
  const rating = req.body.rating;
  const user = req.session.user._id;
  const mentor = req.body.mentor;

  const review = new Review({
    rating: rating,
    content: content,
    user: user,
    mentor: mentor,
  });

  Schedule.findById(id)
    .then((schedule) => {
      schedule.rating = true;
      return schedule.save().then(() => {
        review
          .save()
          .then((review) => {
            console.log(chalk.yellow.inverse(review));
            const convertMentorId = mongoose.Types.ObjectId(mentor);
            Review.aggregate([
              {
                $match: { mentor: convertMentorId },
              },
              {
                $group: { _id: null, avgRating: { $avg: "$rating" } },
              },
            ]).then((resultReview) => {
              console.log(chalk.bgYellow(JSON.stringify(resultReview)));
              let avgRating = resultReview[0].avgRating;
              Mentor.findById(mentor)
                .then((mentors) => {
                  mentors.rating = avgRating;
                  return mentors.save();
                })
                .then((result) => {
                  console.log(chalk.magenta.inverse(result));
                  res.redirect("/user/review");
                })
                .catch((err) => console.log(err));
            });
          })
          .catch((err) => console.log(err));
      });
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

  User.findById(id)
    .then((user) => {
      const oldPassword = user.password;
      bcrypt.compare(password, oldPassword).then((doMatch) => {
        if (doMatch) {
          return bcrypt.hash(newPassword, 12).then((hashedPassword) => {
            User.findById(id)
              .then((users) => {
                users.password = hashedPassword;
                return users.save().then((result, err) => {
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

exports.getPayment = (req, res, next) => {
  const session = req.session.user;
  Payment.find({ user: session._id })
    .sort({ _id: -1 })
    .populate("mentor", "username email")
    .exec()
    .then((payment) => {
      let lastPaymentId = "";
      let lastDatetime = "";

      if (payment.length > 0) {
        console.log(chalk.redBright.inverse("Ada isinya"));
        lastPaymentId = payment[0]._id;
        lastDatetime = payment[0].datetime;
      } else {
        console.log(chalk.red.inverse("Payment Array Kosong"));
      }

      res.render("back/user/payment", {
        moment: moment,
        voca: voca,
        payment: payment,
        session: session,
        currency: currency,
        lastPaymentId: lastPaymentId,
        lastDatetime: lastDatetime,
      });
    })
    .catch((err) => console.log(err));
};

exports.getPaymentJson = (req, res, next) => {
  const session = req.session.user;
  Payment.find({ $and: [{ user: session._id }, { status: true }] })
    .countDocuments()
    .then((payment) => {
      if (payment) {
        res.status(200).json({ message: "Success", total: payment });
      } else {
        res.json({ message: "Data Not Found", total: 0 });
      }
    })
    .catch((err) => console.log(err));
};
