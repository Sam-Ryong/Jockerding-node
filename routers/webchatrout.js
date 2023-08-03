const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const path = require('path');
const cookieSession = require("cookie-session");
const db = require("../Login/app/models/index.js");
const dbConfig = require("../Login/app/config/db.config");
const template = require("../public/template.js");
const authJwt = require("../Login/app/middlewares/authJwt.js");
const User = db.user;

router.use(authJwt.verifyToken);
db.mongoose
  .connect(`mongodb+srv://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    // initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

router.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);

router.get('/chat',async (req,res) => {

  const user = await User.findById(req.userId);
  const code = user.code;
  res.send(template(code)); 

});

module.exports = router;