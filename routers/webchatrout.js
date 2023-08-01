const express = require('express');
const router = express.Router();
const path = require('path');

router.post('/chat',(req,res) => {
    console.log(req.userId);
    console.log(req.session.token);
    res.sendFile(path.resolve(__dirname, "../public/index_wow.html"));
});

module.exports = router;