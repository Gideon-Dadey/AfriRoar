const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validate, contactSchema, newsletterSchema } = require('../middlewares/validate');

router.post('/', validate(contactSchema), contactController.submit);
router.post('/newsletter', validate(newsletterSchema), contactController.subscribeNewsletter);

module.exports = router;
