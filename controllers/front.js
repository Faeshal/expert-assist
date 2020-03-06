const Admin = require("../models/Admin");

exports.getIndex = (req, res, next) => {
  res.render("front/index");
};

exports.getAllBlog = (req, res, next) => {
  // *FindOne mengembalikan object
  // *find mengembalikan array
  Admin.findOne()
    .then(admins => {
      if (!admins) {
        console.log("No Admins Data");
        res.redirect("/");
      } else {
        var blog = admins.blog;
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
