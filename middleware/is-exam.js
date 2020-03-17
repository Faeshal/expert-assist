module.exports = (req, res, next) => {
  if (req.session.mentor.exam == true) {
    return res.redirect("/mentor/dashboard");
  }
  next();
};
