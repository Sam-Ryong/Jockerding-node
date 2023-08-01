const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/chat',(req,res) => {
    res.sendFile(path.resolve(__dirname, "../public/index_wow.html"));
});

module.exports = router;