const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role, enrollment_number, department, graduation_year, cgpa, company_name } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error. Required fields: name, email, password, role.',
          errors: ['MISSING_REQUIRED_FIELDS']
        });
      }

      if (!['student', 'recruiter'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error. Only student and recruiter accounts can register.',
          errors: ['INVALID_ROLE']
        });
      }

      const result = await authService.register({
        name, email, password, role,
        enrollment_number, department, graduation_year, cgpa, company_name
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Authenticated user profile retrieved',
        data: { user }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
