const Admin = require("../models/Admin");
const Mentor = require("../models/Mentor");
const chalk = require("chalk");
const currency = require("currency.js");

exports.getIndex = (req, res, next) => {
  let session = req.session;
  Mentor.find({
    $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }],
  })
    .limit(7)
    .sort({ _id: -1 })
    .then((newMentor) => {
      Mentor.find({ mentorstatus: "true" })
        .limit(7)
        .sort({ rating: -1 })
        .then((bestMentor) => {
          Mentor.find({
            $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }],
          })
            .limit(7)
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
        console.log(admins);
        console.log("===========Convert To Object Below=============");
        var after = {};
        admins.forEach(function (obj) {
          // obj here is the element of the array, i.e. object
          // Looping over all the keys of the object
          Object.keys(obj).forEach(function (key) {
            // key here is the key of the object
            after[key] = obj[key];
          });
        });

        console.log(after);

        var blog = after.blog;
        res.render("front/blog", {
          admin: admins,
          blog: blog,
        });
      }
    })
    .catch((err) => console.log(err));
};

exports.getDetailBlog = (req, res, next) => {
  id = req.params.id;
  Admin.findOne({ "blog._id": id }, { "blog.$": 1 })
    .then((admins) => {
      var blog = admins.blog[0];
      res.render("front/blogdetail", {
        blog: blog,
      });
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
      res.render("front/mentorDetail", {
        mentor: mentor,
        userId: userId,
      });
    })
    .catch((err) => console.log(err));
};

exports.getMentorList = (req, res, next) => {
  Mentor.find()
    .then((mentor) => {
      console.log(chalk.yellowBright(mentor));
      res.render("front/mentorList", {
        mentor: mentor,
        currency: currency,
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
