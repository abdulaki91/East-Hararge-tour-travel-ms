import { CompanyService } from "../services/companyService.js";

export class CompanyController {
  // Register company
  static async registerCompany(req, res) {
    try {
      const userId = req.user.id;
      const companyData = req.body;

      const company = await CompanyService.registerCompany(userId, companyData);

      res.status(201).json({
        success: true,
        message:
          "Company registered successfully. Awaiting admin verification.",
        data: company,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get current user's company
  static async getMyCompany(req, res) {
    try {
      const userId = req.user.id;

      const company = await CompanyService.getCompanyByUserId(userId);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found",
        });
      }

      res.status(200).json({
        success: true,
        data: company,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update company profile
  static async updateCompany(req, res) {
    try {
      const userId = req.user.id;
      const companyData = req.body;

      const company = await CompanyService.updateCompany(userId, companyData);

      res.status(200).json({
        success: true,
        message: "Company updated successfully",
        data: company,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get company statistics
  static async getCompanyStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await CompanyService.getCompanyStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
