const express = require("express");
const router = express.Router();
//middleware 불러오기
const db = require("./app/models");
const User = db.user;

// isLinked = (req, res) => {
//   User.findById(req.userId).exec((err, user) => {
//     //req.userId로 db에서 찾은다음
//     if (err) {
//       res.status(500).send({ message: err });
//       return;
//     }
//     if (user.linked === "False") {
//       return res.send(
//         "링크 페이지로 이동해야한다. html파일을 다르게 보여주면되나..? 아니면 link로 리다이렉션?"
//       );
//     }
//     return res.send(
//       "linked===true라는 뜻이므로 다시 마이페이지 리다이렉션 하면 되어있다는 뜻이므로 homepage html을 쏜다.."
//     );
//     // return res.sendFile("../mypage.html"); 대신 js 마이페이지 리다이렉션 하고 동적으로 html 템플릿 생성하기?
//   });
// };

router.get("/", async (req, res) => {
  req.user = await User.findById(req.userId);
  //     //req.userId로 db에서 찾은다음
  console.log(req.userId);
  // if (!req.user.linked) {
  //   var partner = "?";
  // } else {
  var partner = req.user.oppo_name;
  // }
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
  console.log("in link.js"); //auth에서 user정보 받았고
  // console.log(req.oppoInfo + "in mypage.js"); //linked에서 oppoInfo 받았다.
  //if linked true면 상대방 이름 , false면 그냥 ? 출력하도록
  res.send(template);
});

module.exports = router;
