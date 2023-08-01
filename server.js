const express = require("express");

const app = express();

/* for Angular Client (withCredentials) */
// app.use(
//   cors({
//     credentials: true,
//     origin: ["http://localhost:8081"],
//   })
// );

// parse requests of content-type - application/json




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











// 마이페이지와 같은 원리로 use하게끔.


// routes


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
