const User = require("../models/User");
const Mentor = require("../models/Mentor");
const fileHelper = require("../util/file");
const midtransClient = require("midtrans-client");
// Create Snap API instance
let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-vMgJOtss_zGeLfqAK_KNolSh",
  clientKey: "SB-Mid-client-9HOSFzP6dyj593ww"
});

exports.getDashboard = (req, res, next) => {
  console.log(req.session);
  User.findById(req.session.user)
    .then(user => {
      res.render("back/user/dashboard", {
        user: user
      });
    })
    .catch(err => console.log(err));
};

exports.getProfile = (req, res, next) => {
  User.findById(req.session.user._id)
    .then(user => {
      res.render("back/user/profile", {
        user: user
      });
    })
    .catch();
};

exports.updateProfile = (req, res, next) => {
  const id = req.body.id;
  const username = req.body.username;
  const job = req.body.job;
  const bio = req.body.bio;
  const city = req.body.city;
  const phone = req.body.phone;
  const twitter = req.body.twitter;
  const github = req.body.github;
  const linkedin = req.body.linkedin;
  const profilepicture = req.file;

  User.findOne({ _id: id })
    .then(user => {
      user.username = username;
      user.job = job;
      user.bio = bio;
      user.city = city;
      user.phone = phone;
      user.twitter = twitter;
      user.github = github;
      user.linkedin = linkedin;

      if (profilepicture) {
        fileHelper.deleteFile(mentor.profilepicture);
        user.profilepicture = profilepicture.path.replace("\\", "/");
      }

      return user.save();
    })
    .then(result => {
      console.log("Profile Updated");
      res.redirect("/user/profile");
    })
    .catch(err => console.log(err));
};

// exports.postReview = (req, res, next) => {
//   const content = req.body.content;
//   const rating = req.body.rating;
//   const mentor = req.body.mentor;
//   const user = req.session.user._id;
//   Mentor.findOne({ _id: mentor })
//     .then(mentor => {
//       if (!mentor) {
//         console.log("No Mentor Found");
//       }

//       const review = new Review({
//         user: user,
//         mentor: mentor,
//         content: content,
//         rating: rating
//       });

//       return review.save();
//     })
//     .then(result => {
//       console.log(result);
//       console.log("Review Saved");
//       res.redirect("/");
//     })
//     .catch(err => console.log(err));
// };

// review
//   .populate({ path: "mentor", select: ["username", "email"] })
//   .populate({ path: "user", select: ["username", "email"] })
//   .execPopulate()
//   .then(doc => {
//     console.log(doc);
//   });

exports.getCheckout = (req, res, next) => {
  const id = req.params.id;
  let transactionToken;
  var redirect;
  Mentor.findById(id)
    .then(mentor => {
      // *Midtrans
      let parameter = {
        transaction_details: {
          order_id: "test-transaction-123",
          gross_amount: 1
        },
        credit_card: {
          secure: true
        }
      };
      // create transaction
      snap
        .createTransaction(parameter)
        .then(transaction => {
          // transaction token
          transactionToken = transaction.token;
          midtransactionToken = transaction.token;
          console.log("transactionToken:", transactionToken);

          // transaction redirect url
          let transactionRedirectUrl = transaction.redirect_url;
          redirect = transactionRedirectUrl;
          console.log("transactionRedirectUrl:", transactionRedirectUrl);
        })
        .then(result => {
          res.render("back/user/checkout", {
            mentor: mentor,
            transactionToken: transactionToken,
            redirect: redirect
          });
          console.log(midtransactionToken);
        });
    })
    .catch(err => console.log(err));
};
