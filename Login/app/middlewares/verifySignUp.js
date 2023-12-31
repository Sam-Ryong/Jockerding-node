const db = require("../models");
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
  // Email
  User.findOne({
    email: req.body.email,
  }).exec((err, user) => {
    if (err) {
      return res.redirect("/error");
    }

    if (user) {
      return res.send(`<script>alert('본적 있는 이메일인디..?');
      window.location.href='/signin';
      </script>`);
    }

    next();
  });
};

const verifySignUp = {
  checkDuplicateEmail,
};

module.exports = verifySignUp;
