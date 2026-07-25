const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validate, contactSchema } = require('../middlewares/validate');

router.post('/', validate(contactSchema), contactController.submit);

module.exports = router;
