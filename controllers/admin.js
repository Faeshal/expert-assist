require("pretty-error").start();
require("dotenv").config();
const express = require("express");
const app = express();
const Admin = require("../models/Admin");
const Mentor = require("../models/Mentor");
const Payment = require("../models/Payment");
const Schedule = require("../models/Schedule");
const Withdraw = require("../models/Withdraw");
const User = require("../models/User");
const moment = require("moment");
const v = require("voca");
const axios = require("axios");
const chalk = require("chalk");
const mongoose = require("mongoose");
const currency = require("currency.js");
const longpoll = require("express-longpoll")(app, { DEBUG: true });
const asyncHandler = require("express-async-handler");
const routeCache = require("route-cache");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// * Xendit Withdraw Transfer
const x = require("../middleware/xendit");
const { Disbursement } = x;
const d = new Disbursement({});

// * Get Request video Call API
const base_url = "https://api.daily.co/v1/";
const auth = {
  headers: {
    Authorization:
      "Bearer 6535fe7995967cb3772d206bdc68f43f0e02d3d512243745c1cb747987b06c13",
  },
};

exports.getDashboard = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.session.admin);
  const totalUser = await User.find({ status: "true" }).countDocuments();

  const totalMentor = await Mentor.find({
    $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }],
  }).countDocuments();

  const bestMentor = await Mentor.find({
    $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }],
  })
    .sort({ rating: -1 })
    .limit(3);

  const totalPaymentData = await Payment.aggregate([
    {
      $match: {
        $and: [{ status: true }],
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$total" },
      },
    },
  ]);

  let totalPayment;
  if (totalPaymentData.length < 1) {
    totalPayment = 0;
  } else {
    totalPayment = totalPaymentData[0].total;
  }

  const totalIncomeData = await Withdraw.aggregate([
    {
      $match: {
        $and: [{ status: true }],
      },
    },
    {
      $group: {
        _id: null,
        income: { $sum: "$adminincome" },
      },
    },
  ]);

  let totalIncome;
  if (totalIncomeData.length < 1) {
    totalIncome = 0;
  } else {
    totalIncome = totalIncomeData[0].income;
  }

  const waitingWithdraw = await Withdraw.find({
    status: false,
  }).countDocuments();

  const successwithdraw = await Withdraw.find({
    status: true,
  }).countDocuments();

  const totalWithdrawData = await Withdraw.aggregate([
    {
      $match: {
        $and: [{ status: true }],
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
  if (totalWithdrawData.length < 1) {
    totalWithdraw = 0;
  } else {
    totalWithdraw = totalWithdrawData[0].total;
  }

  const waitingExam = await Mentor.find({
    examstatus: "true",
    mentorstatus: "false",
  }).countDocuments();

  const lastTransaction = await Payment.find({ status: true })
    .limit(3)
    .sort({ _id: -1 })
    .populate("user", "username profilepicture")
    .populate("mentor", "username");

  const successPayment = await Payment.find({ status: true }).countDocuments();

  res.render("back/admin/dashboard", {
    admin: admin,
    pageTitle: "Welcome Admin",
    totalUser: totalUser,
    totalMentor: totalMentor,
    bestMentor: bestMentor,
    currency: currency,
    totalPayment: totalPayment,
    totalIncome: totalIncome,
    waitingWithdraw: waitingWithdraw,
    successwithdraw: successwithdraw,
    totalWithdraw: totalWithdraw,
    waitingExam: waitingExam,
    lastTransaction: lastTransaction,
    successPayment: successPayment,
  });
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.session.admin);
  res.render("back/admin/profile", {
    admin: admin,
    pageTitle: "Admin - Profile",
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const username = req.body.username;
  const phone = req.body.phone;
  const publicemail = req.body.publicemail;
  const id = req.session.admin._id;

  const admin = await Admin.findById(id);
  admin.username = username;
  admin.phone = phone;
  admin.publicemail = publicemail;
  const result = await admin.save();

  res.redirect("/admin/profile");
});

exports.getAllBlog = asyncHandler(async (req, res, next) => {
  const admins = await Admin.findOne();
  let blog = admins.blog;
  res.render("back/admin/blog", {
    blog: blog,
    pageTitle: "Admin - Blog",
    moment: moment,
    v: v,
  });
});

exports.getCreateBlog = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.session.admin);
  res.render("back/admin/blogadd", {
    admin: admin,
    pageTitle: "Admin - Create Blog",
  });
});

exports.createBlog = (req, res, nexta) => {
  const title = req.body.title;
  const image = req.body.image;
  const desc = req.body.desc;
  const content = req.body.content;

  const id = req.session.admin._id;
  Admin.findById(id)
    .then((admin) => {
      admin.blog.push({
        title: title,
        image: image,
        desc: desc,
        content: content,
      });
      return admin.save();
    })
    .then((result) => {
      console.log(result);
      routeCache.removeCache("/blog");
      routeCache.removeCache("/blog/:id");
      res.redirect("/admin/blog");
    })
    .catch((err) => console.log(err));
};

exports.getUpdateBlog = (req, res, next) => {
  const id = req.params.id;
  Admin.findOne({ "blog._id": id }, { "blog.$": 1 })
    .then((admins) => {
      var blog = admins.blog[0];
      console.log(blog);
      res.render("back/admin/blogupdate", {
        blog: blog,
        pageTitle: "Admin - Update Blog",
      });
    })
    .catch((err) => console.log(err));
};

exports.updateBlog = (req, res, next) => {
  const title = req.body.title;
  const image = req.body.image;
  const desc = req.body.desc;
  const status = req.body.status;
  const content = req.body.content;

  const id = req.body.id;
  Admin.updateOne(
    { "blog._id": id },
    {
      $set: {
        "blog.$.title": title,
        "blog.$.image": image,
        "blog.$.desc": desc,
        "blog.$.status": status,
        "blog.$.content": content,
      },
    }
  )
    .then((result) => {
      console.log(result);
      routeCache.removeCache("/blog");
      routeCache.removeCache("/blog/:id");
      res.redirect("/admin/blog");
    })
    .catch((err) => console.log(err));
};

exports.deleteBlog = (req, res, next) => {
  const id = req.body.id;
  console.log(id);
  // * $pull =  Query Native MongoDB
  Admin.updateOne({ $pull: { blog: { _id: id } } })
    .then((admins) => {
      console.log(admins);
      console.log("Blog Deleted");
      routeCache.removeCache("/blog");
      routeCache.removeCache("/blog/:id");
      res.redirect("/admin/blog");
    })
    .catch((err) => console.log(err));
};

exports.getCategory = (req, res, next) => {
  Admin.findOne()
    .then((admins) => {
      console.log(admins);
      var category = admins.category;
      console.log(category);
      res.render("back/admin/category", {
        category: category,
        pageTitle: "Admin - Category",
        moment: moment,
        v: v,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCategory = asyncHandler(async (req, res, next) => {
  const name = req.body.name;
  const testlink = req.body.testlink;
  const id = req.session.admin._id;

  const admin = await Admin.findById(id);
  admin.category.push({
    name: name,
    testlink: testlink,
  });
  const result = await admin.save();
  res.redirect("/admin/category");
});

exports.updateCategory = (req, res, next) => {
  const name = req.body.name;
  const testlink = req.body.testlink;

  const id = req.body.id;
  Admin.updateOne(
    { "category._id": id },
    {
      $set: {
        "category.$.name": name,
        "category.$.testlink": testlink,
      },
    }
  )
    .then((result) => {
      console.log(result);
      res.redirect("/admin/category");
    })
    .catch((err) => console.log(err));
};

exports.deleteCategory = (req, res, next) => {
  const id = req.body.id;
  console.log(id);
  // * $pull =  Query Native MongoDB
  Admin.updateOne({ $pull: { category: { _id: id } } })
    .then((admins) => {
      console.log("Category Deleted");
      res.redirect("/admin/category");
    })
    .catch((err) => console.log(err));
};

exports.getFaq = (req, res, next) => {
  Admin.findOne()
    .then((admins) => {
      let faq = admins.faq;
      res.render("back/admin/faq", {
        faq: faq,
        pageTitle: "Admin - FAQ",
        moment: moment,
        v: v,
      });
    })
    .catch((err) => console.log(err));
};

exports.postFaq = (req, res, next) => {
  const question = req.body.question;
  const answer = req.body.answer;
  const id = req.session.admin._id;
  Admin.findOne(id)
    .then((admin) => {
      admin.faq.push({
        question: question,
        answer: answer,
      });
      return admin.save();
    })
    .then((result) => {
      console.log(result);
      routeCache.removeCache("/faq");
      res.redirect("/admin/faq");
    })
    .catch((err) => console.log(err));
};

exports.updateFaq = (req, res, next) => {
  const question = req.body.question;
  const answer = req.body.answer;

  const id = req.body.id;
  Admin.updateOne(
    { "faq._id": id },
    {
      $set: {
        "faq.$.question": question,
        "faq.$.answer": answer,
      },
    }
  )
    .then((result) => {
      console.log(result);
      routeCache.removeCache("/faq");
      res.redirect("/admin/faq");
    })
    .catch((err) => console.log(err));
};

exports.deleteFaq = (req, res, next) => {
  const id = req.body.id;
  Admin.updateOne({ $pull: { faq: { _id: id } } })
    .then((admins) => {
      console.log(admins);
      console.log("Faq Deleted");
      routeCache.removeCache("/faq");
      res.redirect("/admin/faq");
    })
    .catch((err) => console.log(err));
};

exports.getMentorAll = (req, res, next) => {
  Mentor.find({ $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }] })
    .then((mentor) => {
      res.render("back/admin/mentorAll", {
        mentor: mentor,
        pageTitle: "Admin - All Mentor",
        moment: moment,
      });
    })
    .catch((err) => console.log(err));
};

exports.getMentorExam = asyncHandler(async (req, res, next) => {
  const mentor = await Mentor.find({ mentorstatus: "false" }).sort({ _id: 1 });

  if (!mentor) {
    console.log("No Mentor Unqualified");
  }
  res.render("back/admin/mentorExam", {
    mentor: mentor,
    pageTitle: "Admin - Mentor Exam",
    moment: moment,
  });
});

exports.getMentorExamJson = (req, res, next) => {
  Mentor.find({ mentorstatus: "false" })
    .countDocuments()
    .then((mentor) => {
      if (mentor) {
        res.status(200).json({ message: "success", mentor: mentor });
      } else {
        res.json({ message: "No Mentor was found" });
      }
    })
    .catch((err) => console.log(err));
};

exports.postScore = (req, res, next) => {
  const username = req.body.username;
  const examstatus = req.body.examstatus;
  const id = req.body.id;
  Mentor.findById(id)
    .then((mentor) => {
      mentor.username = username;
      mentor.examstatus = examstatus;
      if (examstatus == "true") {
        mentor.mentorstatus = "new";
      } else {
        mentor.mentorstatus = "false";
      }
      return mentor.save();
    })
    .then((result) => {
      res.redirect("/admin/mentor/exam");
    })
    .catch((err) => console.log(err));
};

exports.resetExam = asyncHandler(async (req, res, next) => {
  const mentor = await Mentor.find({ examstatus: "reject" });
  await Mentor.updateMany(
    { examstatus: "reject" },
    { $set: { examstatus: "false" } }
  );

  // * Make a single array from multiple object
  let email = [];
  mentor.forEach((mentorData) => {
    let emailData = mentorData.email;
    email.push(emailData);
  });

  // * Send Notification New Exam season has open
  const msg = {
    to: email,
    from: "expertassist@example.com",
    subject: "✌ New Exam Season Has Open",
    text: "If you wanna take an exam again, this is your chance",
    html: `<strong>The opportunity has come, if you wanna try to become an expert again, go ahead. Just login in expertassist.com and take the exam. Good Luck</strong>`,
  };
  console.log(chalk.greenBright.inverse("Email Notification was sent"));
  res.redirect("/admin/mentor/exam");
  return sgMail.sendMultiple(msg);
});

exports.getUserAll = (req, res, next) => {
  User.find({ status: "true" })
    .then((user) => {
      res.render("back/admin/userAll", {
        user: user,
        pageTitle: "Admin - All User",
        moment: moment,
        v: v,
      });
    })
    .catch((err) => console.log(err));
};

exports.getBlockUser = (req, res, next) => {
  User.find({ status: "block" })
    .sort({ _id: 1 })
    .then((user) => {
      res.render("back/admin/userBlock", {
        user: user,
        pageTitle: "Admin - user Blocked",
        moment: moment,
        v: v,
      });
    })
    .catch((err) => console.log(err));
};

exports.postUserBlock = (req, res, next) => {
  const id = req.body.id;
  const status = req.body.status;

  User.findById(id)
    .then((user) => {
      user.status = status;
      return user.save();
    })
    .then((result) => {
      res.redirect("/admin/user/block");
    })
    .catch((err) => console.log(err));
};

exports.getBlockMentor = (req, res, next) => {
  Mentor.find({ mentorstatus: "block" })
    .sort({ _id: 1 })
    .then((mentor) => {
      res.render("back/admin/mentorBlock", {
        mentor: mentor,
        pageTitle: "Admin - Mentor Blocked",
        moment: moment,
        v: v,
      });
    })
    .catch((err) => console.log(err));
};

exports.postMentorBlock = (req, res, next) => {
  const id = req.body.id;
  const mentorstatus = req.body.mentorstatus;

  Mentor.findById(id)
    .then((mentor) => {
      mentor.mentorstatus = mentorstatus;
      return mentor.save();
    })
    .then((result) => {
      res.redirect("/admin/mentor/block");
    })
    .catch((err) => console.log(err));
};

exports.getPayment = (req, res, next) => {
  Payment.find({})
    .populate({ path: "user", select: ["username", "email"] })
    .populate({ path: "mentor", select: ["username", "email"] })
    .sort({ _id: -1 })
    .exec()
    .then((payment) => {
      res.render("back/admin/payment", {
        payment: payment,
        pageTitle: "All Payment",
        moment: moment,
        v: v,
        currency: currency,
      });
    });
};

exports.getPaymentJson = (req, res, next) => {
  Payment.aggregate([
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$datetime",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 7 },
  ])
    .sort({ _id: 1 })
    .then((paymentData) => {
      if (paymentData) {
        res.status(200).json({ message: "true", data: paymentData });
      } else {
        res.status(404).json({ message: "false", data: "no data" });
      }
    });
};

exports.getMentoring = (req, res, next) => {
  axios
    .get(base_url + "rooms", auth)
    .then((result) => {
      console.log("----------------");
      console.log(result.data.data);
      let data = result.data.data;
      res.render("back/admin/mentoring", {
        moment: moment,
        pageTitle: "Welcome Admin",
        v: v,
        data: data,
      });
    })
    .catch((err) => console.log(err));
};

exports.getwithdraw = (req, res, next) => {
  Withdraw.find()
    .populate({
      path: "mentor",
      select: ["username", "email", "bankcode", "bankaccountnumber"],
    })
    .sort({ _id: -1 })
    .exec()
    .then((withdraw) => {
      res.render("back/admin/withdraw", {
        moment: moment,
        pageTitle: "Money Withdraw",
        withdraw: withdraw,
        currency: currency,
      });
    })
    .catch((err) => console.log(err));
};

exports.getwithdrawJson = (req, res, next) => {
  Withdraw.aggregate([
    {
      $group: {
        _id: { $month: "$datetime" },
        income: { $sum: "$adminincome" },
      },
    },
    { $sort: { datetime: -1 } },
    { $limit: 6 },
  ])
    .sort({ _id: 1 })
    .then((data) => {
      Withdraw.countDocuments().then((total) => {
        if (total) {
          res
            .status(200)
            .json({ message: "success", data: data, total: total });
        } else {
          res.json({ message: "No Withdraw Found" });
        }
      });
    })

    .catch((err) => console.log(err));
};

exports.postUpdateWithdraw = asyncHandler(async (req, res, next) => {
  const id = req.body.id;
  const mentorId = req.body.mentor;
  const status = req.body.status;

  // * Update Withdraw Status To Mongodb
  const withdraw = await Withdraw.findById(id);
  withdraw.status = status;

  const result = await withdraw.save();
  console.log(chalk.yellow.inverse(result));

  // * Calculate Mentor Income
  const newMentorId = mongoose.Types.ObjectId(mentorId);
  const newWithdraw = await Withdraw.findOne({ mentor: newMentorId })
    .sort({ _id: -1 })
    .limit(1);

  console.log(chalk.red.inverse(newWithdraw));
  let amount = newWithdraw.amount;
  const mentor = await Mentor.findById(newMentorId).select({
    username: 1,
    income: 1,
    bankcode: 1,
    bankaccountnumber: 1,
    bankaccountusername: 1,
  });
  console.log(chalk.greenBright.italic(mentor));
  // * Save New Mentor Income
  let income = mentor.income - amount;
  mentor.income = income;
  await mentor.save();

  // * Send Transfer Request to Xendit
  let stringId = id.toString();
  let bankAccountNumber = mentor.bankaccountnumber;
  let accountNumber = bankAccountNumber.toString();

  let disb = await d.create({
    externalID: stringId,
    bankCode: mentor.bankcode,
    accountHolderName: mentor.bankaccountusername,
    accountNumber: accountNumber,
    description: `Payment Withdraw - ${mentor.username} `,
    amount: withdraw.total,
    xIdempotencyKey: stringId,
  });

  console.log(
    chalk.white.inverse("Disbursement created: ", JSON.stringify(disb))
  );

  res.redirect("/admin/withdraw");

  return longpoll.publish("/pollwithdraw", {
    id: mentorId,
    message: "Withdraw Approve Notification",
    data: true,
  });
});
