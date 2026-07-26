const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

router.get('/', contentController.getPublished);
router.get('/slug/:slug', contentController.getBySlug);

module.exports = router;
