require("pretty-error").start();
const express = require("express");
const app = express();
const asyncHandler = require("express-async-handler");
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
const { findById } = require("../models/User");
const longpoll = require("express-longpoll")(app, { DEBUG: true });

exports.getDashboard = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const user = await User.findById(session._id);

  const totalPayment = await Payment.countDocuments({ user: session._id });

  const failedPayment = await Payment.countDocuments({
    $and: [{ user: session._id }, { approve: true }, { status: false }],
  });

  const incomingSchedule = await Schedule.countDocuments({
    $and: [{ user: session._id }, { approve: "true" }, { status: false }],
  });

  const totalReview = await Review.countDocuments({ user: session._id });

  const waitingSchedule = await Schedule.find({
    $and: [{ user: session._id }, { approve: "false" }],
  }).countDocuments();

  const rejectedSchedule = await Schedule.find({
    $and: [{ user: session._id }, { approve: "reject" }],
  }).countDocuments();

  const nextMentoring = await Schedule.findOne({
    $and: [{ user: session._id }, { approve: "true" }, { status: false }],
  }).sort({ datetime: 1 });

  const finishedMentoring = await Schedule.find({
    $and: [{ user: session._id }, { approve: "true" }, { status: true }],
  }).countDocuments();

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

exports.getProfile = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const user = await User.findById(session._id);
  res.render("back/user/profile", {
    user: user,
    session: session,
  });
});

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

exports.postPayment = asyncHandler(async (req, res, next) => {
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
  const result = await payment.save();
  console.log(chalk.yellow.inverse(result));
  res.redirect("/stripe/" + payment._id);
});

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

exports.postStripeCancel = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const result = await Payment.findByIdAndDelete(id);
  console.log(chalk.red.inverse(`Deleted : ${result}`));
  res.redirect("/");
});

exports.getSchedule = (req, res, next) => {
  const session = req.session.user;
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
          // ** Check , Ada ga jadwal yang di reject sebelumnya.
          Schedule.findOne({
            $and: [{ user: session._id }, { approve: "reject" }],
          })
            .sort({ _id: -1 })
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
                rejectSchedule: rejectSchedule,
                userId: userId,
                mentorId: mentorId,
                duration: duration,
                mentorUsername: mentorUsername,
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

exports.postSchedule = asyncHandler(async (req, res, next) => {
  const user = req.body.user;
  const mentor = req.body.mentor;
  const duration = req.body.duration;
  const datetime = req.body.datetime;
  const note = req.body.note;
  const finishTime = moment(datetime).add(duration, "hours").toISOString();

  // ** Check Jadwal Sudah ada yang booking belum
  const isEqual = await Schedule.findOne({
    $and: [
      { mentor: mentor },
      { approve: "true" },
      { status: false },
      {
        $or: [
          {
            $and: [{ endtime: { $gte: datetime, $lte: finishTime } }],
          },
          {
            $and: [{ datetime: { $gte: datetime, $lte: finishTime } }],
          },
          {
            $and: [
              { datetime: { $gte: datetime }, endtime: { $lte: finishTime } },
            ],
          },
          {
            $and: [
              { datetime: { $lte: datetime }, endtime: { $gte: finishTime } },
            ],
          },
        ],
      },
    ],
  });

  console.log(chalk.whiteBright("isEqual: " + isEqual));

  if (isEqual) {
    console.log(chalk.red.inverse("JADWAL SUDAH DI PESAN"));
    return res.json({ message: false });
  }

  // ** Check ada ga jadwal yang di reject sebelumnya , kalau ada delete data itu
  const lastReject = await Schedule.findOne({
    $and: [{ user: user }, { mentor: mentor }, { approve: "reject" }],
  });

  if (lastReject) {
    await Schedule.findByIdAndDelete(lastReject._id);
    console.log(chalk.red.inverse("Last Rejected Data Succesfully Deleted"));
  }

  // ** Kalau udah lolos semua , baru proses save
  const schedule = new Schedule({
    user: user,
    mentor: mentor,
    duration: duration,
    datetime: datetime,
    endtime: finishTime,
    note: note,
  });

  const result = await schedule.save();
  console.log(chalk.yellow.inverse(result));
  longpoll.publish("/pollmentorschedule", {
    id: mentor,
    message: "New Schedule Notification",
    data: true,
  });
  return res.json({ message: true });
});

exports.postEditSchedule = asyncHandler(async (req, res, next) => {
  const id = req.body.id;
  const datetime = req.body.datetime;
  const schedule = await Schedule.findByIdAndUpdate(id);
  schedule.datetime = datetime;
  const result = await schedule.save();
  console.log(chalk.yellow.inverse(result));
  res.redirect("/user/schedule");
});

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

exports.getLive = asyncHandler(async (req, res, next) => {
  const id = req.session.user._id;
  const schedule = await Schedule.findOne({ user: id }).sort({ datetime: -1 });
  const dateTimeSchedule = schedule.datetime;
  if (schedule.approve == "false" || schedule.approve == "reject") {
    console.log(chalk.red.inverse("Not Auhtorize"));
    return res.render("layouts/404");
  } else if (schedule.approve == "true") {
    res.render("back/user/live", {
      schedule: schedule,
      user: req.session.user._id,
      dateTimeSchedule: dateTimeSchedule,
      moment: moment,
    });
  }
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const review = await Review.find({ user: session._id })
    .populate("mentor", "username")
    .sort({ _id: -1 })
    .exec();
  let schedule = await Schedule.findOne({
    $and: [{ user: session._id }, { status: true }],
  }).sort({ _id: -1 });

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
});

exports.postReview = asyncHandler(async (req, res, next) => {
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

  const schedule = await Schedule.findById(id);
  schedule.rating = true;
  await schedule.save();

  const result = await review.save();
  console.log(chalk.yellow.inverse(result));

  longpoll.publish("/pollmentorreview", {
    id: mentor,
    message: "New Review Notification",
    data: true,
  });

  const convertMentorId = mongoose.Types.ObjectId(mentor);
  const resultReview = await Review.aggregate([
    {
      $match: { mentor: convertMentorId },
    },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" } },
    },
  ]);

  console.log(chalk.bgYellow(JSON.stringify(resultReview)));
  let avgRating = resultReview[0].avgRating;
  const mentors = await Mentor.findById(mentor);

  mentors.rating = avgRating;
  const result2 = await mentors.save();
  console.log(chalk.magenta.inverse(result2));
  res.redirect("/user/review");
});

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

exports.getPayment = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const payment = await Payment.find({ user: session._id })
    .sort({ _id: -1 })
    .populate("mentor", "username email")
    .exec();

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
});

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

// ** Refactor
// exports.postStripeSuccess = asyncHandler(async (req, res, next) => {
//   const id = req.params.id;
//   const payment = await Payment.findById(id);
//   payment.status = true;
//   let idMentor = payment.mentor;
//   await payment.save();
//   await longpoll.publish("/pollmentorpayment", {
//     id: idMentor,
//     message: "New Payment Notification",
//     data: true,
//   });
//   const payment2 = await Payment.findOne().sort({ _id: -1 });
//   let mentorId = payment2.mentor;
//   console.log(chalk.red.inverse(`Mentor ID : ${mentorId}`));
//   const payment3 = await Payment.findOne({ mentor: mentorId })
//     .sort({ _id: -1 })
//     .limit(1);
//   userId = payment3.user;
//   console.log(chalk.yellowBright.inverse(payment));
//   let total = payment.total;
//   const mentor = await Mentor.findById(mentorId);
//   let income = mentor.income + total;
//   mentor.income = income;
//   const result = await mentor.save();
//   console.log(chalk.yellow.inverse(result2));
//   res.redirect("/user/schedule");
// });
