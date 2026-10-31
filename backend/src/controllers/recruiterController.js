const adminService = require('../services/adminService');

class RecruiterController {
  async getApplications(req, res, next) {
    try {
      const applications = await adminService.getAllApplications(req.user.userId);
      res.status(200).json({ success: true, data: { applications } });
    } catch (err) {
      next(err);
    }
  }

  async getInterviews(req, res, next) {
    try {
      const interviews = await adminService.getAllInterviews(req.user.userId);
      res.status(200).json({ success: true, data: { interviews } });
    } catch (err) {
      next(err);
    }
  }

  async saveInterview(req, res, next) {
    try {
      const id = await adminService.saveInterview(
        { ...req.body, id: req.params.id },
        req.user.userId
      );
      const interviews = await adminService.getAllInterviews(req.user.userId);
      res.status(req.params.id ? 200 : 201).json({
        success: true,
        message: 'Interview schedule saved successfully',
        data: { interview: interviews.find(interview => interview.id === Number(id)) }
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteInterview(req, res, next) {
    try {
      await adminService.deleteInterview(req.params.id, req.user.userId);
      res.status(200).json({ success: true, message: 'Interview schedule deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getPlacementResults(req, res, next) {
    try {
      const results = await adminService.getAllPlacementResults(req.user.userId);
      res.status(200).json({ success: true, data: { results } });
    } catch (err) {
      next(err);
    }
  }

  async savePlacementResult(req, res, next) {
    try {
      const id = await adminService.savePlacementResult(req.body, req.user.userId);
      const results = await adminService.getAllPlacementResults(req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Placement result saved successfully',
        data: { result: results.find(result => result.id === Number(id)) }
      });
    } catch (err) {
      next(err);
    }
  }

  async deletePlacementResult(req, res, next) {
    try {
      await adminService.deletePlacementResult(req.params.id, req.user.userId);
      res.status(200).json({ success: true, message: 'Placement result deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecruiterController();
