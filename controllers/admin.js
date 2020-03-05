const Admin = require("../models/Admin");

exports.getDashboard = (req, res, next) => {
  Admin.findById(req.session.admin)
    .then(admin => {
      res.render("back/admin/dashboard", {
        admin: admin
      });
    })
    .catch(err => console.log(err));
};

exports.getProfile = (req, res, next) => {
  Admin.findById(req.session.admin)
    .then(admin => {
      res.render("back/admin/profile", {
        admin: admin
      });
    })
    .catch(err => console.log(err));
};

exports.createProfile = (req, res, next) => {
  const username = req.body.username;
  const phone = req.body.phone;
  const id = req.session.admin._id;
  Admin.findById(id)
    .then(admin => {
      admin.username = username;
      admin.phone = phone;
      return admin.save();
    })
    .then(result => {
      console.log(result);
      res.redirect("/admin/profile");
    })
    .catch(err => console.log(err));
};

exports.getCreateBlog = (req, res, next) => {
  console.log(req.session.admin);
  Admin.findById(req.session.admin)
    .then(admin => {
      res.render("back/admin/blog", {
        admin: admin
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
      res.redirect("/admin/blog");
    })
    .catch(err => console.log(err));
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
