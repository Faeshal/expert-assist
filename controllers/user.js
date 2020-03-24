const User = require("../models/User");
const Mentor = require("../models/Mentor");
const Payment = require("../models/Payment");
const fileHelper = require("../util/file");
const stripe = require("stripe")("sk_test_Tnz59oHlP8YD4orawQO6eUXU00FhO9PLbb");

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
  let mentorUsername;
  let mentorPrice = 0;
  let mentorId;
  res.locals.mentorPrice = mentorPrice;
  Mentor.findById(id)
    .then(mentor => {
      mentorUsername = mentor.username;
      mentorPrice = mentor.price;
      mentorId = mentor._id;
      console.log("------------------");
      console.log(mentorId);
      console.log("------------------");
      // res.locals.mentorId = mentorId;

      // *Stripe
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            name: mentor.username,
            description: "User Payment",
            amount: mentor.price,
            currency: "usd",
            quantity: 1
          }
        ],
        success_url:
          req.protocol +
          "://" +
          req.get("host") +
          "/checkout/success/" +
          mentorId,
        cancel_url: "https://stripe.com/docs/payments/accept-a-payment"
      });
    })
    .then(session => {
      console.log(session.id);
      res.render("back/user/checkout", {
        mentorUsername: mentorUsername,
        mentorPrice: mentorPrice,
        user: req.session.user,
        sessionId: session.id
      });
    })
    .catch(err => console.log(err));
};

exports.postCheckoutSuccess = (req, res, next) => {
  const mentorId = req.params.mentorId;
  console.log("-------MENTOR_ID--------");
  console.log(mentorId);
  const userId = req.session.user._id;
  Mentor.findOne({ _id: mentorId })
    .then(mentor => {
      const payment = new Payment({
        user: userId,
        mentor: mentor._id,
        total: mentor.price
      });
      return payment.save();
    })
    .then(result => {
      console.log(result);
      res.redirect("/");
    })
    .catch(err => console.log(err));
};
