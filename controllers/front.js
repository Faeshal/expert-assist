const Admin = require("../models/Admin");
const User = require("../models/User");
const Mentor = require("../models/Mentor");

exports.getIndex = (req, res, next) => {
  Admin.findOne({ level: "admin" })
    .then(admin => {
      let session = req.session;
      if (!admin) {
        console.log("Admin Not Found");
        res.render("layouts/500");
      } else {
        Mentor.find({
          $or: [{ mentorstatus: "true" }, { mentorstatus: "new" }]
        })
          .then(mentor => {
            console.log(mentor);
            res.render("front/index", {
              admin: admin,
              session: session,
              mentor: mentor
            });
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
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
              $eq: ["$$blog.status", true]
            }
          }
        }
      }
    }
  ])
    .then(admins => {
      if (!admins) {
        console.log("No Admins Data");
        res.redirect("/");
      } else {
        console.log(admins);
        console.log("===========Convert To Object Below=============");
        var after = {};
        admins.forEach(function(obj) {
          // obj here is the element of the array, i.e. object
          // Looping over all the keys of the object
          Object.keys(obj).forEach(function(key) {
            // key here is the key of the object
            after[key] = obj[key];
          });
        });

        console.log(after);

        var blog = after.blog;
        res.render("front/blog", {
          admin: admins,
          blog: blog
        });
      }
    })
    .catch(err => console.log(err));
};

exports.getDetailBlog = (req, res, next) => {
  id = req.params.id;
  Admin.findOne({ "blog._id": id }, { "blog.$": 1 })
    .then(admins => {
      var blog = admins.blog[0];
      res.render("front/blogdetail", {
        blog: blog
      });
    })
    .catch(err => console.log(err));
};
