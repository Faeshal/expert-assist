const Admin = require("../models/Admin");
const User = require("../models/User");
const Auth = require("../models/Auth");

exports.getDashboard = (req, res, next) => {
  Auth.findById(req.auth.id)
    .then(auth => {
      if (!auth) {
        console.log("No Auth Data");
      }
      User.count().then(totalUser => {
        if (!totalUser) {
          console.log("No Data");
        }
        res.render("back/admin/dashboard", {
          auth: auth,
          totalUser: totalUser
        });
      });
    })
    .catch(err => console.log(err));
};
