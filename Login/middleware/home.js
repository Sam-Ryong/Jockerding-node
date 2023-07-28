const express = require("express");
const cookieParser = require("cookie-parser");
const router = express.Router();
const User = require("../../models/User.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.use(cookieParser());

module.exports = async (req, res, next) => {
  const cookieId = await req.cookies.cookieId;
  console.log(cookieId);
  try {
    const userInfo = {
      ...User.filter((user) => user.id === cookieId)[0],
    };
    //case cookieId가 존재하지 않으면 로그인 실패
    if (!cookieId || !userInfo.id) {
      res.redirect("/auth");
    } else {
      //case DB에 일치하는 회원정보를 찾으면 응답에 전달
      delete userInfo.password;
      next(userInfo);
    }
  } catch (error) {
    console.error(error.message);
    res.send("home.js에서 발생한 에러");
  }
};
