const User = require("../models/User");
const Mentor = require("../models/Mentor");
const Payment = require("../models/Payment");
const Schedule = require("../models/Schedule");
const Review = require("../models/Review");
const fileHelper = require("../util/file");
const { validationResult } = require("express-validator");
const moment = require("moment");
const stripe = require("stripe")("sk_test_Tnz59oHlP8YD4orawQO6eUXU00FhO9PLbb");
const axios = require("axios");
const voca = require("voca");
const chalk = require("chalk");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

exports.getDashboard = (req, res, next) => {
  User.findById(req.session.user)
    .then((user) => {
      const message = req.flash("message", "Flash is back!");
      console.log(chalk.yellow(message));

      res.render("back/user/dashboard", {
        user: user,
        message: message,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProfile = (req, res, next) => {
  User.findById(req.session.user._id)
    .then((user) => {
      res.render("back/user/profile", {
        user: user,
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
  const total = req.body.total;
  const duration = req.body.duration;
  const payment = new Payment({
    user: user,
    mentor: mentor,
    total: total,
    duration: duration,
  });
  return payment
    .save()
    .then((result) => {
      console.log(chalk.yellow.inverse(result));
      res.redirect("/stripe");
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  const id = req.params.id;
  const duration = req.body.duration;
  console.log("===============");
  console.log(duration);
  let mentorUsername;
  let mentorPrice = 0;
  let priceConvert = 0;
  let mentorId;
  res.locals.mentorPrice = mentorPrice;
  Mentor.findById(id)
    .then((mentor) => {
      mentorPrice = mentor.price;
      priceConvert = mentorPrice * 100;
      mentorUsername = mentor.username;
      mentorId = mentor._id;
      console.log("------------------");
      console.log(mentorId);
      console.log("------------------");

      // *Stripe
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            name: "Mentor Payment",
            description: "Expert-Assist Payment System",
            amount: priceConvert,
            currency: "idr",
            quantity: 1,
          },
        ],
        success_url:
          req.protocol +
          "://" +
          req.get("host") +
          "/checkout/success/" +
          mentorId,
        cancel_url: "https://stripe.com/docs/payments/accept-a-payment",
      });
    })
    .then((session) => {
      console.log(session.id);
      res.render("back/user/checkout", {
        mentorUsername: mentorUsername,
        mentorPrice: mentorPrice,
        user: req.session.user,
        sessionId: session.id,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCheckoutSuccess = (req, res, next) => {
  const mentorId = req.params.mentorId;
  const userId = req.session.user._id;
  // ** Save Payment From Stripe To Database
  Mentor.findOne({ _id: mentorId })
    .then((mentor) => {
      const payment = new Payment({
        user: userId,
        mentor: mentor._id,
        total: mentor.price,
      });
      return payment.save();
    })
    .then((result) => {
      console.log(result);
      const newMentorId = mongoose.Types.ObjectId(mentorId);
      // ** get the last payment
      Payment.findOne({ mentor: newMentorId })
        .sort({ _id: -1 })
        .limit(1)
        .then((payment) => {
          // console.log(chalk.yellowBright.inverse(payment));
          let total = payment.total;
          // console.log("-----------------");
          Mentor.findById(mentorId)
            .then((mentor) => {
              // ** sum the last payment with intial income from mentor collection
              let income = mentor.income + total;
              mentor.income = income;
              return mentor.save();
            })
            .then((mentorIncome) => {
              res.redirect("/user/schedule");
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getSchedule = (req, res, next) => {
  const id = req.session.user._id;
  Payment.findOne({ user: id })
    .populate("user", "username")
    .populate("mentor", "username")
    .exec()
    .then((payment) => {
      console.log(payment);

      Schedule.find({ user: req.session.user._id })
        .populate("mentor", "username")
        .exec()
        .then((schedule) => {
          console.log(schedule);
          res.render("back/user/schedule", {
            user: req.session.user,
            payment: payment,
            schedule: schedule,
            moment: moment,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postSchedule = (req, res, next) => {
  const user = req.body.user;
  const mentor = req.body.mentor;
  const datetime = req.body.datetime;
  const note = req.body.note;
  const schedule = new Schedule({
    user: user,
    mentor: mentor,
    datetime: datetime,
    note: note,
  });
  return schedule
    .save()
    .then((result) => {
      console.log(result);
      res.redirect("/user/schedule");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteSchedule = (req, res, next) => {
  const id = req.body.id;
  Schedule.findByIdAndDelete(id)
    .then((schedule) => {
      console.log(chalk.redBright(schedule));
      res.redirect("/user/schedule");
    })
    .catch((err) => console.log(err));
};

exports.getMentoring = (req, res, next) => {
  const id = req.session.user._id;
  Payment.findOne({ user: id })
    .then((payment) => {
      if (!payment) {
        console.log("User Not Yet Pay");
      }
      Schedule.findOne({ user: id })
        .then((schedule) => {
          res.render("back/user/mentoring", {
            payment: payment,
            schedule: schedule,
            user: id,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getLive = (req, res, next) => {
  const id = req.session.user._id;
  Schedule.findOne({ user: id })
    .then((schedule) => {
      console.log(schedule);
      if (schedule.approve == false) {
        res.render("layouts/404");
        console.log("Not Auhtorize");
      } else if (schedule.approve == true) {
        res.render("back/user/live", {
          schedule: schedule,
          user: req.session.user._id,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.getReview = (req, res, next) => {
  const id = req.session.user._id;

  Review.find({ user: id })
    .populate("mentor", "username")
    .exec()
    .then((review) => {
      console.log(chalk.blueBright(review));

      Schedule.findOne({ $and: [{ user: id }, { approve: true }] })
        .then((schedule) => {
          res.render("back/user/review", {
            user: id,
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
            res.redirect("/user/review");
          })
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => console.log(err));
};

exports.postUpdateReview = (req, res, next) => {
  const id = req.body.id;
  const mentor = req.body.mentor;
  const user = req.session.user._id;
  const content = req.body.content;
  const rating = req.body.rating;

  Review.findById(id)
    .then((review) => {
      review.user = user;
      review.mentor = mentor;
      review.content = content;
      review.rating = rating;
      return review.save();
    })
    .then((result) => {
      console.log(chalk.yellow.inverse(result));
      res.redirect("/user/review");
    })
    .catch((err) => console.log(err));
};

exports.deleteReview = (req, res, next) => {
  const id = req.body.id;
  Review.findByIdAndDelete(id)
    .then((result) => {
      console.log(chalk.yellow(result));
      res.redirect("/user/review");
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
  const id = req.session.user._id;
  Payment.find({ user: id })
    .populate("mentor", "username email")
    .exec()
    .then((payment) => {
      console.log(chalk.yellowBright(payment));
      res.render("back/user/payment", {
        moment: moment,
        voca: voca,
        payment: payment,
        user: id,
      });
    })
    .catch((err) => console.log(err));
};
