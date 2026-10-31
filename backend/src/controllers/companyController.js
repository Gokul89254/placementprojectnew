const companyService = require('../services/companyService');

class CompanyController {
  async createCompany(req, res, next) {
    try {
      const company = await companyService.createCompany(req.user.userId, req.user.role, req.body);
      res.status(201).json({
        success: true,
        message: 'Company profile created successfully',
        data: { company }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllCompanies(req, res, next) {
    try {
      const companies = await companyService.getAllCompanies();
      res.status(200).json({
        success: true,
        message: 'Companies retrieved successfully',
        data: { companies }
      });
    } catch (err) {
      next(err);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const company = await companyService.getCompanyById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Company details retrieved successfully',
        data: { company }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const company = await companyService.updateCompany(
        req.params.id,
        req.user.userId,
        req.user.role,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Company profile updated successfully',
        data: { company }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CompanyController();
