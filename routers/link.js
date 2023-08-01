const express = require("express");
const router = express.Router();
//middleware 불러오기
const db = require("../app/models");
const User = db.user;


router.get("/", async (req, res) => {
  req.user = await User.findById(req.userId);

  console.log(req.userId);
  var partner = req.user.oppo_name;
  var template = `
  <!doctype html>
  <html>
  <head>
    <title>linkpage</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>내 코드 : ${req.user.code}</h2>
    <form action="/api/auth/link" method="POST">
      <label for="oppo_code">상대방코드 입력하기</label>
      <input type="text" id="oppo_code" name="oppo_code" />
      <button type="submit">연결하기</button>
      <a href="./signup" class="btn btn-outline-primary">Sign up</a>
  </form>
  </body>
  </html>
  `;
  console.log("in link.js");

  res.send(template);
});

module.exports = router;
