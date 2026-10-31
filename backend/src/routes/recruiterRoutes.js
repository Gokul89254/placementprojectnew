const express = require('express');
const recruiterController = require('../controllers/recruiterController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticateToken, requireRole('recruiter'));

router.get('/applications', (req, res, next) => recruiterController.getApplications(req, res, next));
router.get('/interviews', (req, res, next) => recruiterController.getInterviews(req, res, next));
router.post('/interviews', (req, res, next) => recruiterController.saveInterview(req, res, next));
router.put('/interviews/:id', (req, res, next) => recruiterController.saveInterview(req, res, next));
router.delete('/interviews/:id', (req, res, next) => recruiterController.deleteInterview(req, res, next));
router.get('/placements', (req, res, next) => recruiterController.getPlacementResults(req, res, next));
router.post('/placements', (req, res, next) => recruiterController.savePlacementResult(req, res, next));
router.delete('/placements/:id', (req, res, next) => recruiterController.deletePlacementResult(req, res, next));

module.exports = router;
