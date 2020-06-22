require("pretty-error").start();
const express = require("express");
const app = express();
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
const longpoll = require("express-longpoll")(app);
const asyncHandler = require("express-async-handler");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

exports.getDashboard = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const mentor = await Mentor.findOne({ _id: session._id });

  const totalClient = await Payment.countDocuments({
    $and: [{ mentor: session._id }, { status: true }],
  });

  const totalReview = await Review.countDocuments({ mentor: session._id });

  const userData = await Schedule.find({
    $and: [{ mentor: session._id }, { status: false }],
  })
    .populate({
      path: "user",
      select: ["username", "email", "profilepicture", "phone"],
    })
    .limit(3)
    .sort({ datetime: 1 });

  const waitingSchedule = await Schedule.find({
    $and: [{ mentor: session._id }, { approve: "false" }],
  }).countDocuments();

  const rejectSchedule = await Schedule.find({
    $and: [{ mentor: session._id }, { approve: "reject" }],
  }).countDocuments();

  const waitingWithdraw = await Withdraw.find({
    $and: [{ mentor: session._id }, { status: false }],
  }).countDocuments();

  const withdrawSuccess = await Withdraw.find({
    $and: [{ mentor: session._id }, { status: true }],
  }).countDocuments();

  const nextMentoring = await Schedule.findOne({
    $and: [{ mentor: session._id }, { approve: "true" }, { status: false }],
  }).sort({ datetime: 1 });

  console.log(chalk.white.inverse(nextMentoring));

  const totalWithdrawData = await Withdraw.aggregate([
    {
      $match: {
        $and: [{ mentor: session._id }, { status: true }],
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
      },
    },
  ]);

  let totalWithdraw;
  if (totalWithdrawData.length == 0) {
    totalWithdraw = 0;
  } else {
    totalWithdraw = totalWithdrawData[0].total;
  }

  const incomingSchedule = await Schedule.find({
    $and: [{ mentor: session._id }, { approve: "true" }, { status: false }],
  }).countDocuments();

  res.render("back/mentor/dashboard", {
    mentor: mentor,
    currency: currency,
    session: session,
    totalClient: totalClient,
    totalReview: totalReview,
    voca: voca,
    userData: userData,
    moment: moment,
    waitingSchedule: waitingSchedule,
    rejectSchedule: rejectSchedule,
    waitingWithdraw: waitingWithdraw,
    withdrawSuccess: withdrawSuccess,
    nextMentoring: nextMentoring,
    totalWithdraw: totalWithdraw,
    incomingSchedule: incomingSchedule,
  });
});

exports.postMentorStatus = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const mentorstatus = req.body.mentorstatus;
  const mentorusername = voca.slugify(req.body.mentorusername);
  const slugUsername = mentorusername;
  const firstString = voca.first(session._id, 3);
  const lastString = voca.last(session._id, 3);
  const roomName = slugUsername + "-" + firstString + lastString;

  let data = {
    name: roomName,
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

  const mentor = await Mentor.findById(req.session.mentor._id);
  mentor.mentorstatus = mentorstatus;
  mentor.videocallroom = roomName;
  await mentor.save();
  res.redirect("/mentor/profile");
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const mentor = await Mentor.findById(session._id);
  res.render("back/mentor/profile", {
    mentor: mentor,
    session: session,
  });
});

exports.getPayment = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const payment = await Payment.find({
    $and: [{ mentor: session._id }, { status: true }],
  })
    .populate("user", "username email")
    .sort({ _id: -1 });
  const mentor = await Mentor.findById(session._id);
  res.render("back/mentor/payment", {
    mentor: mentor,
    payment: payment,
    voca: voca,
    moment: moment,
    currency: currency,
    session: session,
  });
});

exports.getPaymentJson = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const paymentData = await Payment.aggregate([
    {
      $match: { mentor: session._id },
    },
    {
      $group: {
        _id: { $month: "$datetime" },
        income: { $sum: "$total" },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 6 },
  ]);

  const total = await Payment.find({
    $and: [{ mentor: session._id }, { status: true }],
  }).countDocuments();

  if (!total) {
    res.json({ message: "No Mentor Data", data: 0 });
  }
  res.status(200).json({ message: true, data: paymentData, total: total });
});

exports.getUpdateProfile = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const mentor = await Mentor.findById(session._id);
  res.render("back/mentor/profileUpdate", {
    mentor: mentor,
    session: session,
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
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
  const skill = req.body.skill;
  const bankname = req.body.bankname;
  const bankaccount = req.body.bankaccount;
  const profilepicture = req.files["profilepicture"];
  const coverpicture = req.files["coverpicture"];

  console.log("*********************");
  console.log(req.files["profilepicture"]);
  console.log("================");
  console.log(req.files["coverpicture"]);
  console.log("================");
  console.log(req.files);

  const mentor = await Mentor.findOne({ _id: id });

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
  } else {
    mentor.profilepicture = req.files["profilepicture"][0].path.replace(
      "\\",
      "/"
    );
  }

  if (coverpicture) {
    // fileHelper.deleteFile(mentor.coverpicture);
    mentor.coverpicture = req.files["coverpicture"][0].path.replace("\\", "/");
  } else {
    mentor.coverpicture = req.files["coverpicture"][0].path.replace("\\", "/");
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
  mentor.skill = skill;
  mentor.bankname = bankname;
  mentor.bankaccount = bankaccount;

  const result = await mentor.save();

  console.log(chalk.yellow.inverse(result));
  res.redirect("/mentor/profile");
});

exports.getExam = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const admin = await Admin.findOne({ level: "admin" });
  // ! Bug - Handle eror , kalau category exam belum di set admin
  // console.log(admin.category[0].name);
  if (!admin) {
    console.log("Admin not found");
    return res.render("layouts/500");
  }
  const mentor = await Mentor.findById(session._id);
  res.render("back/mentor/exam", {
    mentor: mentor,
    admin: admin,
    session: session,
  });
});

exports.postExam = asyncHandler(async (req, res, next) => {
  const expertise = req.body.expertise;
  const id = req.session.mentor._id;
  const mentor = await Mentor.findById(id);
  mentor.expertise = expertise;
  const result = await mentor.save();
  console.log(chalk.yellow.inverse(result));
  res.redirect("/mentor/exam/begin");
});

exports.postBeginExam = asyncHandler(async (req, res, next) => {
  const examstatus = req.body.examstatus;
  const mentor = Mentor.findById(req.session.mentor._id);
  mentor.examstatus = examstatus;
  await mentor.save();
  longpoll.publish("/pollexam", {
    message: "Incoming New Mentor Exam",
    data: true,
  });
});

exports.getBeginExam = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const admin = await Admin.findOne({ level: "admin" });

  if (!admin) {
    console.log("Admin not found");
  }
  const mentor = await Mentor.findById(session._id);
  if (!mentor.expertise) {
    console.log("Not Auhtorize");
    return res.render("layouts/404");
  } else if (mentor.examstatus == true) {
    console.log("Exam Finished");
    res.redirect("/mentor/dashboard");
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
      session: session,
    });
  }
});

exports.getSchedule = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const schedule = await Schedule.find({ mentor: session._id })
    .populate({ path: "user", select: ["username", "email"] })
    .sort({ _id: -1 });
  const mentor = await Mentor.findById(session._id);

  res.render("back/mentor/schedule", {
    mentor: mentor,
    schedule: schedule,
    moment: moment,
    session: session,
    voca: voca,
  });
});

exports.postUpdateSchedule = asyncHandler(async (req, res, next) => {
  const id = req.body.id;
  const approve = req.body.approve;
  const link = req.body.link;
  const schedule = await Schedule.findById(id)
    .populate("user", "email")
    .populate("mentor", "email");
  schedule.approve = approve;
  schedule.link = link;

  const status = schedule.approve;
  const datetime = schedule.datetime;

  // ** Waktu di jadwal , Dengan format normal (ISO time)
  const calendarTime = moment(datetime).format("LLLL");
  // ** Waktu di jadwal , dikurangi 1 Jam dan dirubah ke format UNIX time
  const unixTime = moment(datetime).subtract(15, "minutes").unix();
  console.log(chalk.green.inverse(unixTime));

  const userEmail = schedule.user.email;
  const mentorEmail = schedule.mentor.email;

  const result = await schedule.save();
  console.log(chalk.yellow.inverse(result));

  // ** Polling
  const userId = result.user;
  longpoll.publish("/polluserschedule", {
    id: userId,
    message: "Schedule Approve Notification",
    data: true,
  });

  res.redirect("/mentor/schedule");

  // ** Send Email Before Mentoring Come
  if (status == "true") {
    const msg = {
      to: [userEmail, mentorEmail],
      send_each_at: [unixTime, unixTime],
      from: "expertassist@example.com",
      subject: "Incoming Mentoring Notification",
      text: "Dont Forget to attend to your mentoring session",
      html: `<strong>Your mentoring session will begin at ${calendarTime}. Please come on time for making best mentoring experience. See you there.</strong>`,
    };
    console.log(chalk.greenBright.inverse("Sendgrid Schedule Email Set"));
    return sgMail.send(msg);
  }
});

exports.getMentoring = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const dateTimeNow = new Date();
  const schedule = await Schedule.findOne({
    $and: [{ mentor: session._id }, { approve: "true" }, { status: false }],
  })
    .populate("user", "username")
    .sort({ datetime: 1 });

  let dateTimeSchedule = "";
  if (schedule) {
    console.log(chalk.red.inverse("Array Schedule Ada Isinya"));
    dateTimeSchedule = schedule.datetime;
  } else {
    console.log(chalk.redBright.inverse("Array Schedule Kosong"));
  }
  console.log(chalk.blueBright.inverse(schedule));
  res.render("back/mentor/mentoring", {
    schedule: schedule,
    mentor: req.session.mentor._id,
    dateTimeSchedule: dateTimeSchedule,
    dateTimeNow: dateTimeNow,
    moment: moment,
    session: session,
  });
});

exports.getLive = asyncHandler(async (req, res, next) => {
  const id = req.session.mentor._id;
  const schedule = await Schedule.findOne({ mentor: id }).sort({ _id: -1 });
  console.log(chalk.blue.inverse(schedule));
  const dateTimeSchedule = schedule.datetime;
  if (schedule.approve == "false" || schedule.approve == "reject") {
    console.log("Not Auhtorize");
    return res.render("layouts/404");
  }
  res.render("back/mentor/live", {
    schedule: schedule,
    mentor: req.session.mentor._id,
    dateTimeSchedule: dateTimeSchedule,
  });
});

exports.postFinishMentoring = asyncHandler(async (req, res, next) => {
  const id = req.body.id;
  const status = req.body.status;
  const schedule = await Schedule.findById(id);
  schedule.status = status;
  const result = await schedule.save();
  console.log(chalk.yellow.inverse(result));
  res.redirect("/mentor/schedule");
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const review = await Review.find({ mentor: session._id })
    .sort({ _id: -1 })
    .populate("user", "username")
    .exec();
  const schedule = await Schedule.findOne({
    $and: [{ mentor: session._id }, { approve: true }],
  });
  const mentor = await Mentor.findById(session._id);

  res.render("back/mentor/review", {
    mentor: mentor,
    review: review,
    moment: moment,
    voca: voca,
    schedule: schedule,
    session: session,
  });
});

exports.getWithdraw = asyncHandler(async (req, res, next) => {
  const session = req.session.mentor;
  const mentor = await Mentor.findById(session._id);
  if (!mentor) {
    console.log("No Mentor");
  }
  const payment = await Payment.findOne({ mentor: session._id });
  console.log(chalk.blue(payment));
  const withdraw = await Withdraw.find({ mentor: session._id }).sort({
    _id: -1,
  });

  let lastWithdrawId = "";
  let lastDatetime = "";

  if (withdraw.length > 0) {
    console.log(chalk.redBright.inverse("Ada isinya"));
    lastWithdrawId = withdraw[0]._id;
    lastDatetime = withdraw[0].datetime;
    console.log(chalk.redBright.inverse(lastWithdrawId));
  } else {
    console.log(chalk.red.inverse("Withdraw Array Kosong"));
  }

  res.render("back/mentor/withdraw", {
    moment: moment,
    voca: voca,
    mentor: mentor,
    payment: payment,
    withdraw: withdraw,
    currency: currency,
    session: session,
    lastWithdrawId: lastWithdrawId,
    lastDatetime: lastDatetime,
  });
});

exports.postWithdraw = asyncHandler(async (req, res, next) => {
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

  const result = await withdraw.save();
  console.log(chalk.yellow.inverse(result));

  longpoll.publish("/polladminwithdraw", {
    message: "New Withdraw Request Notification",
    data: true,
  });

  res.redirect("/mentor/withdraw");
});

exports.deleteWithdraw = asyncHandler(async (req, res, next) => {
  const id = req.body.id;
  const withdraw = await Withdraw.findByIdAndDelete(id);
  console.log(chalk.yellow.inverse(withdraw));
  res.redirect("/mentor/withdraw");
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

  const mentor = await Mentor.findById(id);

  const oldPassword = mentor.password;
  const doMatch = await bcrypt.compare(password, oldPassword);

  if (doMatch) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const mentors = await Mentor.findById(id);
    mentors.password = hashedPassword;

    const result = await mentors.save();
    console.log(chalk.yellowBright(result));
    res.status(201).json(result);
  } else {
    console.log(chalk.redBright("password not match"));
    res.status(422).json({ error: "password not match" });
  }
});
