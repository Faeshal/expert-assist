const Admin = require("../models/Admin");

exports.getDashboard = (req, res, next) => {
  console.log(req.session.admin.blog);
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
  Admin.find()
    .then(admins => {
      console.log("------------");
      console.log(admins);
      res.render("front/blog", {
        admin: admins
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Hutang.find()
    .then(hutangs => {
      res.render("index", {
        hut: hutangs,
        pageTitle: "Index",
        path: "/",
        title: "index"
      });
    })
    .catch(err => console.log(err));
};
