module.exports = (req, res, next) => {
  if (req.session.mentor.examstatus == true) {
    return res.redirect("/mentor/dashboard");
  }
  next();
};
