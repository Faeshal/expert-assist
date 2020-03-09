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

exports.getAllBlog = (req, res, next) => {
  Admin.findOne()
    .then(admins => {
      var blog = admins.blog;
      res.render("back/admin/bloglist", {
        blog: blog
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
        blog: blog
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
        category: category
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
        faq: faq
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
