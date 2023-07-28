const express = require("express");
const cookieParser = require("cookie-parser");
const router = express.Router();
const app = express();
const User = require("../models/User.js");

router.use(cookieParser());

const errorGenerator = (message, statusCode = 500) => {
  // error 를 핸들링 하는 함수
  const error = new Error(message); // error 객체를 생성
  error.statusCode = statusCode;
  throw error; // error 를 핸들링 하는 하는 미들웨어로 에러를 던진다.
};

async function updateUser(userId, updatedData) {
  try {
    // 유저 정보 업데이트
    const result = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!result) {
      console.log("User not found.");
    } else {
      console.log("User updated successfully:", result);
    }
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

module.exports = async (req, res, next) => {
  try {
    const cookieId = await req.cookies.cookieId;
    console.log(cookieId + "linked.js");
    const userInfo = await User.findOne({ cookieId });
    // const userInfo = {
    //     ...User.filter((user) => user.id === cookieId)[0],
    //     //이거 [0] 지워도 될것 같은데 확인해보기
    //   };
    console.log(userInfo);

    const _code = await req.body;
    //form문으로 입력받은 상대방 코드를 보내기}
    if (!_code) errorGenerator("Invalid _code", 400); //input으로 들어오지 않은 경우에 잘못된 인풋이라는 에러를 던진다

    const oppoInfo = await User.findOne({ _code }).select("-password");
    //상대방 비밀번호까지 주면 안될것 같았음...(당연함)
    console.log(oppoInfo); //입력받은 상대방 코드로 조회한다.
    if (!oppoInfo) errorGenerator("Partner not found", 404);

    const emailCheck = await (oppoInfo.email === userInfo.opponent);
    //emailCheck booltype으로 값 비교하고
    console.log(emailCheck);

    updateUser("cookieId", { linked: true, oppo_name: oppoInfo.name });
    console.log(userInfo);

    req.oppoInfo = oppoInfo;
    //
    next();
  } catch (err) {
    next(err);
  }
};
