const express = require('express');
const router = express.Router();
const { convertTextToSpeech } = require('../controllers/textToSpeechController');

router.post('/tts', convertTextToSpeech);

module.exports = router;
