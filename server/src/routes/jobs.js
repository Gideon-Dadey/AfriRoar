const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/', jobController.getAll);
router.get('/slug/:slug', jobController.getBySlug);
router.get('/:id', jobController.getById);

module.exports = router;
