const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole, requireMajorAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and 'admin' role
router.use(authenticateToken);
router.use(requireRole('admin'));

router.patch('/account/password', (req, res, next) => adminController.changePassword(req, res, next));
router.get('/admins', (req, res, next) => adminController.getAdmins(req, res, next));
router.post('/admins', requireMajorAdmin, (req, res, next) => adminController.createAdmin(req, res, next));
router.patch('/admins/:id', requireMajorAdmin, (req, res, next) => adminController.updateAdmin(req, res, next));
router.delete('/admins/:id', requireMajorAdmin, (req, res, next) => adminController.deleteAdmin(req, res, next));
router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));
router.get('/students', (req, res, next) => adminController.getStudents(req, res, next));
router.get('/recruiters', (req, res, next) => adminController.getRecruiters(req, res, next));
router.delete('/recruiters/:id', (req, res, next) => adminController.deleteRecruiter(req, res, next));
router.get('/companies', (req, res, next) => adminController.getCompanies(req, res, next));
router.patch('/companies/:id/status', (req, res, next) => adminController.updateCompanyStatus(req, res, next));
router.delete('/companies/:id', (req, res, next) => adminController.deleteCompany(req, res, next));
router.get('/jobs', (req, res, next) => adminController.getJobs(req, res, next));
router.get('/applications', (req, res, next) => adminController.getApplications(req, res, next));
router.patch('/jobs/:id/status', (req, res, next) => adminController.updateJobStatus(req, res, next));
router.get('/interviews', (req, res, next) => adminController.getInterviews(req, res, next));
router.get('/placements', (req, res, next) => adminController.getPlacementResults(req, res, next));

module.exports = router;
