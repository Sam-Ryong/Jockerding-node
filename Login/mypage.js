const express = require("express");
const router = express.Router();
//middleware 불러오기
const db = require("./app/models");
const User = db.user;

router.get("/", async (req, res) => {
  req.user = await User.findById(req.userId);
  //     //req.userId로 db에서 찾은다음
  console.log(req.userId);
  // if (!req.user.linked) {
  //   var partner = "?";
  // } else {
  var partner = req.user.oppo_name;
  //partner가 undefined이면
  var template = `
  <!doctype html>
  <html>
  <head>
    <title>mypage</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>${req.user.username}와 ${partner}</h2>
    <a href="./link">커플 연결하기</a>
    <button><a href = "https://zackinthebox.tech:3000/chat">이제부터 존댓말 할까요<a></button>
    <form action="/api/auth/signout" method="post">
    <button id="signout">로그아웃</button></form>
    <script>
    </script>

  </body>
  </html>
  `;
  console.log("in mypage.js"); //auth에서 user정보 받았고
  // console.log(req.oppoInfo + "in mypage.js"); //linked에서 oppoInfo 받았다.
  //if linked true면 상대방 이름 , false면 그냥 ? 출력하도록
  res.send(template);
});

module.exports = router;
