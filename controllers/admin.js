const Admin = require("../models/Admin");
const Mentor = require("../models/Mentor");
const Payment = require("../models/Payment");
const User = require("../models/User");
const moment = require("moment");
const v = require("voca");

exports.getDashboard = (req, res, next) => {
  Admin.findById(req.session.admin)
    .then(admin => {
      res.render("back/admin/dashboard", {
        admin: admin,
        pageTitle: "Welcome Admin"
      });
      console.log(req.session);
    })
    .catch(err => console.log(err));
};

exports.getProfile = (req, res, next) => {
  Admin.findById(req.session.admin)
    .then(admin => {
      res.render("back/admin/profile", {
        admin: admin,
        pageTitle: "Admin - Profile"
      });
    })
    .catch(err => console.log(err));
};

exports.updateProfile = (req, res, next) => {
  const username = req.body.username;
  const phone = req.body.phone;
  const publicemail = req.body.publicemail;
  const id = req.session.admin._id;
  Admin.findById(id)
    .then(admin => {
      admin.username = username;
      admin.phone = phone;
      admin.publicemail = publicemail;
      return admin.save();
    })
    .then(result => {
      console.log(result);
      res.redirect("/admin/profile");
    })
    .catch(err => console.log(err));
};

exports.getAllBlog = (req, res, next) => {
  Admin.findOne()
    .then(admins => {
      var blog = admins.blog;
      res.render("back/admin/blog", {
        blog: blog,
        pageTitle: "Admin - Blog"
      });
    })
    .catch(err => console.log(err));
};

exports.getCreateBlog = (req, res, next) => {
  console.log(req.session.admin);
  Admin.findById(req.session.admin)
    .then(admin => {
      res.render("back/admin/blogadd", {
        admin: admin,
        pageTitle: "Admin - Create Blog"
      });
    })
    .catch(err => console.log(err));
};

exports.createBlog = (req, res, nexta) => {
  const title = req.body.title;
  const image = req.body.image;
  const desc = req.body.desc;
  const content = req.body.content;

  const id = req.session.admin._id;
  Admin.findById(id)
    .then(admin => {
      admin.blog.push({
        title: title,
        image: image,
        desc: desc,
        content: content
      });
      return admin.save();
    })
    .then(result => {
      console.log(result);
      res.redirect("/admin/bloglist");
    })
    .catch(err => console.log(err));
};

exports.getUpdateBlog = (req, res, next) => {
  const id = req.params.id;
  Admin.findOne({ "blog._id": id }, { "blog.$": 1 })
    .then(admins => {
      var blog = admins.blog[0];
      console.log(blog);
      res.render("back/admin/blogupdate", {
        blog: blog,
        pageTitle: "Admin - Update Blog"
      });
    })
    .catch(err => console.log(err));
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
        "blog.$.content": content
      }
    }
  )
    .then(result => {
      console.log(result);
      res.redirect("/admin/bloglist");
    })
    .catch(err => console.log(err));
};

exports.deleteBlog = (req, res, next) => {
  const id = req.body.id;
  console.log(id);
  // * $pull =  Query Native MongoDB
  Admin.updateOne({ $pull: { blog: { _id: id } } })
    .then(admins => {
      console.log(admins);
      console.log("Blog Deleted");
      res.redirect("/admin/bloglist");
    })
    .catch(err => console.log(err));
};

exports.getCategory = (req, res, next) => {
  Admin.findOne()
    .then(admins => {
      console.log(admins);
      var category = admins.category;
      console.log("=====================");
      console.log(category);
      res.render("back/admin/category", {
        category: category,
        pageTitle: "Admin - Category",
        moment: moment
      });
    })
    .catch(err => console.log(err));
};

exports.postCategory = (req, res, next) => {
  const name = req.body.name;
  const testlink = req.body.testlink;
  const id = req.session.admin._id;
  Admin.findById(id)
    .then(admin => {
      admin.category.push({
        name: name,
        testlink: testlink
      });
      return admin.save();
    })
    .then(result => {
      console.log(result);
      res.redirect("/admin/category");
    })
    .catch(err => console.log(err));
};

exports.updateCategory = (req, res, next) => {
  const name = req.body.name;
  const testlink = req.body.testlink;

  const id = req.body.id;
  Admin.updateOne(
    { "category._id": id },
    {
      $set: {
        "category.$.name": name,
        "category.$.testlink": testlink
      }
    }
  )
    .then(result => {
      console.log(result);
      res.redirect("/admin/category");
    })
    .catch(err => console.log(err));
};

exports.deleteCategory = (req, res, next) => {
  const id = req.body.id;
  console.log(id);
  // * $pull =  Query Native MongoDB
  Admin.updateOne({ $pull: { category: { _id: id } } })
    .then(admins => {
      console.log(admins);
      console.log("Category Deleted");
      res.redirect("/admin/category");
    })
    .catch(err => console.log(err));
};

exports.getFaq = (req, res, next) => {
  Admin.findOne()
    .then(admins => {
      let faq = admins.faq;
      res.render("back/admin/faq", {
        faq: faq,
        pageTitle: "Admin - FAQ"
      });
    })
    .catch(err => console.log(err));
};

exports.postFaq = (req, res, next) => {
  const question = req.body.question;
  const answer = req.body.answer;
  const id = req.session.admin._id;
  Admin.findOne(id)
    .then(admin => {
      admin.faq.push({
        question: question,
        answer: answer
      });
      return admin.save();
    })
    .then(result => {
      console.log(result);
      res.redirect("/admin/faq");
    })
    .catch(err => console.log(err));
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
        "faq.$.answer": answer
      }
    }
  )
    .then(result => {
      console.log(result);
      res.redirect("/admin/faq");
    })
    .catch(err => console.log(err));
};

exports.deleteFaq = (req, res, next) => {
  const id = req.body.id;
  Admin.updateOne({ $pull: { faq: { _id: id } } })
    .then(admins => {
      console.log(admins);
      console.log("Faq Deleted");
      res.redirect("/admin/faq");
    })
    .catch(err => console.log(err));
};

exports.getNews = (req, res, next) => {
  Admin.findOne()
    .then(admins => {
      var news = admins.news;
      res.render("back/admin/news", {
        news: news,
        pageTitle: "Admin - News"
      });
    })
    .catch(err => console.log(err));
};

exports.postNews = (req, res, next) => {
  const title = req.body.title;
  const desc = req.body.desc;
  const target = req.body.target;
  const content = req.body.content;

  const id = req.session.admin._id;
  Admin.findOne(id)
    .then(admin => {
      admin.news.push({
        title: title,
        desc: desc,
        target: target,
        content: content
      });
      return admin.save();
    })
    .then(result => {
      console.log(result);
      res.redirect("/admin/news");
    })
    .catch(err => console.log(err));
};

exports.updateNews = (req, res, next) => {
  const title = req.body.title;
  const desc = req.body.desc;
  const target = req.body.target;
  const content = req.body.content;

  const id = req.body.id;
  Admin.updateOne(
    { "news._id": id },
    {
      $set: {
        "news.$.title": title,
        "news.$.desc": desc,
        "news.$.target": target,
        "news.$.content": content
      }
    }
  )
    .then(result => {
      console.log(result);
      res.redirect("/admin/news");
    })
    .catch(err => console.log(err));
};

exports.deleteNews = (req, res, next) => {
  const id = req.body.id;
  Admin.updateOne({ $pull: { news: { _id: id } } })
    .then(admins => {
      console.log(admins);
      console.log("News Deleted");
      res.redirect("/admin/news");
    })
    .catch(err => console.log(err));
};

exports.getMentorAll = (req, res, next) => {
  Mentor.find({ $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }] })
    .then(mentor => {
      res.render("back/admin/mentorAll", {
        mentor: mentor,
        pageTitle: "Admin - All Mentor",
        moment: moment
      });
    })
    .catch(err => console.log(err));
};

exports.getMentorExam = (req, res, next) => {
  Mentor.find({ mentorstatus: "false" })
    .sort({ _id: 1 })
    .then(mentor => {
      if (!mentor) {
        console.log("No Mentor Unqualified");
      }
      res.render("back/admin/mentorExam", {
        mentor: mentor,
        pageTitle: "Admin - Mentor Exam",
        moment: moment
      });
    })
    .catch(err => console.log(err));
};

exports.postScore = (req, res, next) => {
  const username = req.body.username;
  const mentorstatus = req.body.mentorstatus;
  const id = req.body.id;
  Mentor.findById(id)
    .then(mentor => {
      mentor.username = username;
      mentor.mentorstatus = mentorstatus;
      return mentor.save();
    })
    .then(result => {
      res.redirect("/admin/mentor/exam");
    })
    .catch(err => console.log(err));
};

exports.getUserAll = (req, res, next) => {
  User.find({ status: "true" })
    .then(user => {
      res.render("back/admin/userAll", {
        user: user,
        pageTitle: "Admin - All User",
        moment: moment,
        v: v
      });
    })
    .catch(err => console.log(err));
};

exports.getBlockUser = (req, res, next) => {
  User.find({ status: "block" })
    .sort({ _id: 1 })
    .then(user => {
      res.render("back/admin/userBlock", {
        user: user,
        pageTitle: "Admin - user Blocked",
        moment: moment,
        v: v
      });
    })
    .catch(err => console.log(err));
};

exports.postUserBlock = (req, res, next) => {
  const id = req.body.id;
  const status = req.body.status;

  User.findById(id)
    .then(user => {
      user.status = status;
      return user.save();
    })
    .then(result => {
      res.redirect("/admin/user/block");
    })
    .catch(err => console.log(err));
};

exports.getBlockMentor = (req, res, next) => {
  Mentor.find({ mentorstatus: "block" })
    .sort({ _id: 1 })
    .then(mentor => {
      res.render("back/admin/mentorBlock", {
        mentor: mentor,
        pageTitle: "Admin - Mentor Blocked",
        moment: moment,
        v: v
      });
    })
    .catch(err => console.log(err));
};

exports.postMentorBlock = (req, res, next) => {
  const id = req.body.id;
  const mentorstatus = req.body.mentorstatus;

  Mentor.findById(id)
    .then(mentor => {
      mentor.mentorstatus = mentorstatus;
      return mentor.save();
    })
    .then(result => {
      res.redirect("/admin/mentor/block");
    })
    .catch(err => console.log(err));
};

exports.getPayment = (req, res, next) => {
  Payment.find({})
    .populate({ path: "user", select: ["username", "email"] })
    .populate({ path: "mentor", select: ["username", "email"] })
    .exec()
    .then(payment => {
      console.log(payment);
      res.render("back/admin/payment", {
        payment: payment,
        pageTitle: "All Payment",
        moment: moment,
        v: v
      });
    });
};
