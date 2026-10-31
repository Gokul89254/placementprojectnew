const adminService = require('../services/adminService');

class AdminController {
  async changePassword(req, res, next) {
    try {
      await adminService.changeAdminPassword(req.user.userId, req.body);
      res.status(200).json({ success: true, message: 'Admin password updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async createAdmin(req, res, next) {
    try {
      const admin = await adminService.createAdmin(req.body);
      res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        data: { admin }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAdmins(req, res, next) {
    try {
      const admins = await adminService.getAllAdmins();
      res.status(200).json({
        success: true,
        message: 'Admin accounts retrieved successfully',
        data: { admins }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateAdmin(req, res, next) {
    try {
      const admin = await adminService.updateAdmin(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Admin account updated successfully',
        data: { admin }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteAdmin(req, res, next) {
    try {
      await adminService.deleteAdmin(req.params.id);
      res.status(200).json({ success: true, message: 'Admin account deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const metrics = await adminService.getDashboardMetrics();
      res.status(200).json({
        success: true,
        message: 'Admin dashboard metrics retrieved successfully',
        data: { metrics }
      });
    } catch (err) {
      next(err);
    }
  }

  async getStudents(req, res, next) {
    try {
      const directory = await adminService.getStudentDirectory(req.query);
      res.status(200).json({
        success: true,
        message: 'Students list retrieved successfully',
        data: directory
      });
    } catch (err) {
      next(err);
    }
  }

  async getCompanies(req, res, next) {
    try {
      const companies = await adminService.getAllCompanies();
      res.status(200).json({
        success: true,
        message: 'Companies list retrieved successfully',
        data: { companies }
      });
    } catch (err) {
      next(err);
    }
  }

  async getRecruiters(req, res, next) {
    try {
      const recruiters = await adminService.getAllRecruiters();
      res.status(200).json({
        success: true,
        message: 'Recruiters list retrieved successfully',
        data: { recruiters }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteCompany(req, res, next) {
    try {
      await adminService.deleteCompany(req.params.id);
      res.status(200).json({ success: true, message: 'Company deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateCompanyStatus(req, res, next) {
    try {
      const company = await adminService.updateCompanyStatus(req.params.id, req.body.status);
      res.status(200).json({
        success: true,
        message: `Company status updated to '${company.status}' successfully`,
        data: { company }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteRecruiter(req, res, next) {
    try {
      await adminService.deleteRecruiter(req.params.id);
      res.status(200).json({ success: true, message: 'Recruiter deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getJobs(req, res, next) {
    try {
      const jobs = await adminService.getAllJobs();
      res.status(200).json({
        success: true,
        message: 'Jobs list retrieved successfully',
        data: { jobs }
      });
    } catch (err) {
      next(err);
    }
  }

  async getApplications(req, res, next) {
    try {
      const directory = await adminService.getApplicationDirectory();
      res.status(200).json({
        success: true,
        message: 'Applications list retrieved successfully',
        data: directory
      });
    } catch (err) {
      next(err);
    }
  }

  async updateJobStatus(req, res, next) {
    try {
      const { status } = req.body;
      const job = await adminService.updateJobStatus(req.params.id, status);
      res.status(200).json({
        success: true,
        message: `Job posting status updated to '${status}' successfully`,
        data: { job }
      });
    } catch (err) {
      next(err);
    }
  }

  async getInterviews(req, res, next) {
    try {
      const interviews = await adminService.getAllInterviews();
      res.status(200).json({ success: true, data: { interviews } });
    } catch (err) {
      next(err);
    }
  }

  async getPlacementResults(req, res, next) {
    try {
      const results = await adminService.getAllPlacementResults();
      res.status(200).json({ success: true, data: { results } });
    } catch (err) {
      next(err);
    }
  }

}

module.exports = new AdminController();
