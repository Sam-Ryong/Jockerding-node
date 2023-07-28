const mongoose = require("mongoose");

//user data에 대한 틀인 Schema 생성
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, //사용자의 이메일 주소가 고유해야한다는 것을 의미
  },

  opponent: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  code: {
    type: String,
  },

  oppo_name: {
    type: String,
  },

  linked: {
    type: Boolean,
  },
});

//Schema를 만들고 그 Schema의 형태를 갖는 data들을 저장하는 model을 만들어줘야 한다.
//data를 구분해주는 역할을 하는 model export 해주기
module.exports = User = mongoose.model("user", UserSchema);
