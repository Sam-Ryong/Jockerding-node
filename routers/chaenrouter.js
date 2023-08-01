const express = require('express');
const router = express.Router();
const path = require('path');

router.use(express.json());
router.use(express.urlencoded({ extended: true}));

router.get("/signup", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../html/register.html"));
});

router.get("/signin", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../html/login.html"));
});

router.get("/", (req, res) => {
    if (req.userId) {
  
        res.redirect("/mypage");
    }
    else {
      // 인증되지 않은 사용자인 경우
      res.redirect("/signin");
      //signin으로 리다이렉션하기
    }
 });

module.exports = router;