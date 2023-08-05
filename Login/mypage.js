const express = require("express");
const router = express.Router();
//middleware 불러오기
const db = require("./app/models");
const User = db.user;

router.get("/", async (req, res) => {
  try {
    req.user = await User.findById(req.userId);
    //     //req.userId로 db에서 찾은다음
    console.log(req.userId);
    if (!req.user.linked) {
      var partner = "?";
    } else {
      var partner = req.user.oppo_name;
    }
    //partner가 undefined이면
    var template = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <link rel="stylesheet" href="./index.css" />
      <title>mypage</title>
    </head>
    <body>
      <div class="container" id="container">


        <div class="form-container sign-in-container">     
        <div class="name">대화가 필요해...</div> 
        <a href="./link">내 짝꿍 찾으러가기</a>

          <h2>${req.user.username} ♥ ${partner}</h2>
  <br> 
          <div class="fightButton" id="myFightButton">
            <p class="btnText">READY?</p>
            <div class="btnTwo">
              <p class="btnText2">GO!</p></div> 
                  
                         

          </div><form action="/api/auth/signout" method="post">
      <button class="signout btnText">로그아웃</button></form>  
        </div>
      </div>

      <script>
      var fightButton = 
        document
          .getElementById("myFightButton");
          fightButton.addEventListener("click", function () {
            var targetUrl = "https://zackinthebox.tech:3000/chat";
            window.location.href = targetUrl;
          });
      </script>
    </body>
  </html>
  
  `;
    console.log("in mypage.js"); //auth에서 user정보 받았고
    // console.log(req.oppoInfo + "in mypage.js"); //linked에서 oppoInfo 받았다.
    //if linked true면 상대방 이름 , false면 그냥 ? 출력하도록
    res.send(template);
  } catch {
    res.redirect("/signin");
  }
});

module.exports = router;
