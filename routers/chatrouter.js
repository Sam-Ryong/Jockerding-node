const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/',(req,res) => {
    res.sendFile(path.resolve(__dirname, "../chat_html/index_wow.html"));
});

module.exports = router;