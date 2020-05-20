const Admin = require("../models/Admin");
const Mentor = require("../models/Mentor");
const Schedule = require("../models/Schedule");
const chalk = require("chalk");
const currency = require("currency.js");
const ITEMS_PER_PAGE = 6;
const voca = require("voca");
const moment = require("moment");

exports.getIndex = (req, res, next) => {
  let session = req.session;
  Mentor.find({
    $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }],
  })
    .limit(7)
    .sort({ _id: -1 })
    .then((newMentor) => {
      Mentor.find({ mentorstatus: "true" })
        .limit(3)
        .sort({ rating: -1 })
        .then((bestMentor) => {
          Mentor.find({
            $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }],
          })
            .limit(3)
            .sort({ price: 1 })
            .then((cheapestMentor) => {
              res.render("front/index", {
                session: session,
                newMentor: newMentor,
                bestMentor: bestMentor,
                cheapestMentor: cheapestMentor,
                currency: currency,
              });
            });
        });
    })
    .catch((err) => console.log(err));
};

exports.getAllBlog = (req, res, next) => {
  // *FindOne mengembalikan object
  // *find mengembalikan array
  // *Aggreagte juga mengembalikan array , jadi harus diconvert jadi object dulu
  Admin.aggregate([
    {
      $project: {
        blog: {
          $filter: {
            input: "$blog",
            as: "blog",
            cond: {
              $eq: ["$$blog.status", true],
            },
          },
        },
      },
    },
  ])
    .then((admins) => {
      if (!admins) {
        console.log("No Admins Data");
        res.redirect("/");
      } else {
        // console.log(admins);
        // console.log("===========Convert To Object Below=============");
        var after = {};
        admins.forEach(function (obj) {
          // obj here is the element of the array, i.e. object
          // Looping over all the keys of the object
          Object.keys(obj).forEach(function (key) {
            // key here is the key of the object
            after[key] = obj[key];
          });
        });

        // console.log(after);

        var blog = after.blog;
        res.render("front/blog", {
          admin: admins,
          blog: blog,
          moment: moment,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.getFaq = (req, res, next) => {
  Admin.find()
    .then((admin) => {
      res.render("front/faq", {
        admin: admin,
        voca: voca,
      });
    })
    .catch((err) => console.log(err));
};

exports.getDetailBlog = (req, res, next) => {
  id = req.params.id;
  Admin.findOne({ "blog._id": id }, { "blog.$": 1 })
    .then((admins) => {
      let blog = admins.blog[0];
      Admin.find({ status: true })
        .then((admins2) => {
          let allBlog = admins2[0].blog;
          res.render("front/blogdetail", {
            blog: blog,
            allBlog: allBlog,
            moment: moment,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getDetailMentor = (req, res, next) => {
  const id = req.params.id;
  let userId = req.session;
  console.log(userId);

  if (!userId.user) {
    console.log(chalk.blue.inverse("No User Session"));
    console.log(chalk.redBright.inverse(userId));
    userId = "xxx";
  } else if (userId) {
    console.log(chalk.blue.inverse("User Session Found"));
    userId = req.session.user._id;
    console.log(chalk.yellow.inverse(userId));
  }

  Mentor.findOne({ _id: id })
    .then((mentor) => {
      let skillString = mentor.skill;
      Schedule.find({
        $and: [{ mentor: id }, { approve: true }, { status: false }],
      })
        .limit(4)
        .sort({ datetime: 1 })
        .then((schedule) => {
          let skillString = mentor.skill;
          res.render("front/mentorDetail", {
            mentor: mentor,
            userId: userId,
            schedule: schedule,
            moment: moment,
            voca: voca,
            skillString: skillString,
          });
        });
    })
    .catch((err) => console.log(err));
};

exports.getSearch = (req, res, next) => {
  const search = req.query.search;
  const trim = voca.trim(search);
  // const searchTrim = search.trim();
  const page = +req.query.page || 1;
  let totalMentors = 1;
  if (trim == "page=1" || trim == null || trim == "") {
    console.log("Redirect harusnya");
    res.redirect("/mlist");
  } else {
    Mentor.find({ $text: { $search: trim } })
      .sort({ _id: -1 })
      .then((mentor) => {
        Mentor.countDocuments().then(() => {
          res.render("front/mentorList", {
            mentor: mentor,
            currency: currency,
            totalMentors: totalMentors,
            currentPage: 1,
            hasNextPage: ITEMS_PER_PAGE * page < totalMentors,
            hasPreviousPage: page > 1,
            nextPage: 0,
            previousPage: page - 1,
            lastPage: Math.ceil(totalMentors / ITEMS_PER_PAGE),
          });
        });
      })
      .catch((err) => console.log(err));
  }
};

exports.getMentorList = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalMentors;
  Mentor.countDocuments()
    .then((numMentors) => {
      totalMentors = numMentors;
      return Mentor.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((mentor) => {
      res.render("front/mentorList", {
        mentor: mentor,
        currency: currency,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalMentors,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalMentors / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => console.log(err));
};

exports.getMentorListJson = (req, res, next) => {
  Mentor.find()
    .then((mentor) => {
      Mentor.countDocuments().then((total) => {
        if (mentor) {
          res.status(200).json({ message: true, data: mentor, total: total });
        } else {
          res.json({ message: "No Mentor Data", total: 0 });
        }
      });
    })
    .catch((err) => console.log(err));
};
