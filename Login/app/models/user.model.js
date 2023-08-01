const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    partnerMail: String,
    code: String,
    linked: Boolean,
    oppo_name: String,
  })
);

module.exports = User;
