require("pretty-error").start();
require("dotenv").config();
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
const voca = require("voca");
const async = require("async");
const currency = require("currency.js");
const chalk = require("chalk");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const longpoll = require("express-longpoll")(app, { DEBUG: true });
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// * Payment Gateway
const x = require("../middleware/xendit");
const { Invoice } = x;
const i = new Invoice({});

exports.getDashboard = asyncHandler(async (req, res, next) => {
  const session = req.session.user;

  async.parallel(
    {
      user: function (callback) {
        User.findById(session._id).lean().exec(callback);
      },
      totalPayment: function (callback) {
        Payment.countDocuments({ user: session._id }).lean().exec(callback);
      },
      failedPayment: function (callback) {
        Payment.countDocuments({
          $and: [{ user: session._id }, { approve: true }, { status: false }],
        })
          .lean()
          .exec(callback);
      },
      incomingSchedule: function (callback) {
        Schedule.countDocuments({
          $and: [{ user: session._id }, { approve: "true" }, { status: false }],
        })
          .lean()
          .exec(callback);
      },
      totalReview: function (callback) {
        Review.countDocuments({ user: session._id }).lean().exec(callback);
      },
      waitingSchedule: function (callback) {
        Schedule.find({
          $and: [{ user: session._id }, { approve: "false" }],
        })
          .countDocuments()
          .lean()
          .exec(callback);
      },
      rejectedSchedule: function (callback) {
        Schedule.find({
          $and: [{ user: session._id }, { approve: "reject" }],
        })
          .countDocuments()
          .lean()
          .exec(callback);
      },
      nextMentoring: function (callback) {
        Schedule.findOne({
          $and: [{ user: session._id }, { approve: "true" }, { status: false }],
        })
          .sort({ datetime: 1 })
          .lean()
          .exec(callback);
      },
      finishedMentoring: function (callback) {
        Schedule.find({
          $and: [{ user: session._id }, { approve: "true" }, { status: true }],
        })
          .countDocuments()
          .lean()
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        next(err);
      }
      res.render("back/user/dashboard", {
        session: session,
        moment: moment,
        user: results.user,
        totalPayment: results.totalPayment,
        failedPayment: results.failedPayment,
        incomingSchedule: results.incomingSchedule,
        totalReview: results.totalReview,
        waitingSchedule: results.waitingSchedule,
        rejectedSchedule: results.rejectedSchedule,
        nextMentoring: results.nextMentoring,
        finishedMentoring: results.finishedMentoring,
      });
    }
  );
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const user = await User.findById(session._id).lean();
  res.render("back/user/profile", {
    user: user,
    session: session,
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
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

  const user = await User.findOne({ _id: id });

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

  const result = await user.save();

  console.log(chalk.yellow.inverse(result));
  res.redirect("/user/profile");
});

exports.postPayment = asyncHandler(async (req, res, next) => {
  const user = req.body.user;
  const mentor = req.body.mentor;
  const price = req.body.price;
  const duration = req.body.duration;
  const total = price * duration;

  // * Send To MongoDB
  const payment = new Payment({
    user: user,
    mentor: mentor,
    price: price,
    total: total,
    duration: duration,
  });
  const result = await payment.save();
  console.log(chalk.yellow.inverse(result));

  const lastPayment = await Payment.findById(result._id).populate(
    "user",
    "email"
  );
  const paymentId = lastPayment._id;
  const userEmail = lastPayment.user.email;
  console.log(chalk.white.inverse("Last Payment:" + lastPayment));

  // * Send To xendit
  let invoice = await i.createInvoice({
    externalID: paymentId,
    payerEmail: userEmail,
    description: "Expert Assist-Payment Mentor",
    amount: total,
    shouldSendEmail: true,
    xIdempotencyKey: paymentId,
    successRedirectURL:
      req.protocol + "://" + req.get("host") + "/payment/success/" + paymentId,
    failureRedirectURL:
      req.protocol + "://" + req.get("host") + "/payment/cancel/" + paymentId,
  });

  let url = invoice.invoice_url;

  res.redirect(url);
});

exports.postXenditSuccess = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const payment = await Payment.findById(id)
    .populate("mentor", "username email")
    .populate("user", "username email");
  payment.status = true;
  const result = await payment.save();
  console.log(chalk.red(result));

  const payment2 = await Payment.findOne().sort({ _id: -1 });
  const mentorId = payment2.mentor;

  // ** get the last payment
  const lastPayment = await Payment.findOne({ mentor: mentorId })
    .sort({ _id: -1 })
    .limit(1);

  userId = lastPayment.user;
  let total = lastPayment.total;

  const mentor = await Mentor.findById(mentorId);

  // ** sum the last payment with intial income from mentor collection
  let income = mentor.income + total;
  mentor.income = income;

  const mentorIncome = await mentor.save();
  console.log(chalk.red.inverse(mentorIncome));

  longpoll.publish("/poolmentor", {
    id: mentorId,
    message: "New Payment Notification",
    data: true,
  });

  res.redirect("/user/schedule");
});

exports.postXenditCancel = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const result = await Payment.findByIdAndDelete(id);
  console.log(chalk.red.inverse(`Deleted : ${result}`));
  res.redirect("/");
});

exports.getSchedule = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const payment = await Payment.findOne({ user: session._id })
    .sort({ _id: -1 })
    .populate("user", "username")
    .populate("mentor", "username")
    .lean();

  const schedule = await Schedule.find({ user: session._id })
    .sort({ _id: -1 })
    .populate("mentor", "username")
    .lean();

  // ** Check , Ada ga jadwal yang di reject sebelumnya.
  const rejectSchedule = await Schedule.findOne({
    $and: [{ user: session._id }, { approve: "reject" }],
  })
    .sort({ _id: -1 })
    .populate("mentor", "username");
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
  res.json({ message: true });
  return longpoll.publish("/poolmentor", {
    id: mentor,
    message: "New Schedule Notification",
    data: true,
  });
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

exports.getMentoring = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const dateTimeNow = new Date();
  const payment = await Payment.findOne({ user: session._id });
  if (!payment) {
    console.log("User Not Yet Pay");
  }
  let schedule = await Schedule.findOne({
    $and: [{ user: session._id }, { approve: "true" }, { status: false }],
  })
    .sort({ datetime: 1 })
    .populate("mentor", "username");

  let dateTimeSchedule = "";
  if (schedule) {
    dateTimeSchedule = schedule.datetime;
  } else {
    schedule = 0;
  }

  let now = moment().format();
  let newdate = new Date();
  let hasil = Math.abs(dateTimeSchedule - newdate);
  let incoming = moment.utc(hasil).format("LTS");

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
});

exports.getLive = asyncHandler(async (req, res, next) => {
  const id = req.session.user._id;
  const schedule = await Schedule.findOne({ user: id })
    .sort({ _id: -1 })
    .populate("mentor", "videocallroom")
    .lean();
  const endTime = schedule.endtime;
  if (schedule.approve == "false" || schedule.approve == "reject") {
    console.log(chalk.red.inverse("Not Auhtorize"));
    return res.render("layouts/404");
  } else if (schedule.approve == "true") {
    res.render("back/user/live", {
      schedule: schedule,
      user: req.session.user._id,
      endTime: endTime,
      moment: moment,
    });
  }
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  async.parallel(
    {
      one: function (callback) {
        Review.find({ user: session._id })
          .populate("mentor", "username")
          .sort({ _id: -1 })
          .exec(callback);
      },
      two: function (callback) {
        Schedule.findOne({
          $and: [{ user: session._id }, { status: true }],
        })
          .sort({ _id: -1 })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        console.log(err);
      }
      res.render("back/user/review", {
        session: session,
        review: results.one,
        schedule: results.two,
        moment: moment,
        voca: voca,
      });
    }
  );
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

  const convertMentorId = mongoose.Types.ObjectId(mentor);
  const resultReview = await Review.aggregate([
    {
      $match: { mentor: convertMentorId },
    },
    {
      $group: { _id: null, avgRating: { $avg: "$rating" } },
    },
  ]).lean();

  console.log(chalk.bgYellow(JSON.stringify(resultReview)));
  let avgRating = resultReview[0].avgRating;
  const mentors = await Mentor.findById(mentor);

  mentors.rating = avgRating;
  await mentors.save();

  res.redirect("/user/review");

  return longpoll.publish("/poolmentor", {
    id: mentor,
    message: "New Review Notification",
    data: true,
  });
});

exports.postChangePassword = asyncHandler(async (req, res, next) => {
  const id = req.body.id;
  const password = req.body.password;
  const newPassword = req.body.newPassword;

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).jsonp(errors.array());
  } else {
    console.log(chalk.green.inverse("lulus uji express-validator"));
  }

  const user = await User.findById(id);
  const oldPassword = user.password;

  const doMatch = await bcrypt.compare(password, oldPassword);
  if (doMatch) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const users = await User.findById(id);
    users.password = hashedPassword;
    const result = await users.save();
    console.log(chalk.yellowBright(result));
    res.json(result);
  } else {
    console.log(chalk.redBright("password not match"));
    res.status(422).json({ error: "password not match" });
  }
});

exports.getPayment = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const payment = await Payment.find({ user: session._id })
    .sort({ _id: -1 })
    .populate("mentor", "username email")
    .lean();

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

exports.getPaymentJson = asyncHandler(async (req, res, next) => {
  const session = req.session.user;
  const payment = await Payment.find({
    $and: [{ user: session._id }, { status: true }],
  })
    .countDocuments()
    .lean();
  if (!payment) {
    res.json({ message: "Data Not Found", total: 0 });
  }
  res.status(200).json({ message: "Success", total: payment });
});
