import { PackageService } from "../services/packageService.js";
import pool from "../config/database.js";

export class PackageController {
  static async createPackage(req, res) {
    try {
      // Get company for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You must register as a company to create packages",
        });
      }

      const companyId = companies[0].id;

      // Handle uploaded images
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          // Store relative path for the uploaded file
          imageUrls.push(`/uploads/packages/${file.filename}`);
        });
      }

      // Add image URLs to package data
      const packageData = {
        ...req.body,
        images: imageUrls,
      };

      const createdPackage = await PackageService.createPackage(
        companyId,
        packageData,
      );

      res.status(201).json({
        success: true,
        message: "Package created successfully",
        data: createdPackage,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getPackages(req, res) {
    try {
      const result = await PackageService.getPackages(req.query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getPackageById(req, res) {
    try {
      const { id } = req.params;
      const packageData = await PackageService.getPackageById(id);

      if (!packageData) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      res.status(200).json({
        success: true,
        data: packageData,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updatePackage(req, res) {
    try {
      const { id } = req.params;

      // Get company for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;

      // Handle uploaded images
      const updateData = { ...req.body };
      if (req.files && req.files.length > 0) {
        const imageUrls = [];
        req.files.forEach((file) => {
          imageUrls.push(`/uploads/packages/${file.filename}`);
        });
        updateData.images = imageUrls;
      }

      const packageData = await PackageService.updatePackage(
        id,
        companyId,
        updateData,
      );

      res.status(200).json({
        success: true,
        message: "Package updated successfully",
        data: packageData,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deletePackage(req, res) {
    try {
      const { id } = req.params;

      // Get company for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;
      await PackageService.deletePackage(id, companyId);

      res.status(200).json({
        success: true,
        message: "Package deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getMyPackages(req, res) {
    try {
      // Get company for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;
      const result = await PackageService.getCompanyPackages(
        companyId,
        req.query,
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async togglePackageStatus(req, res) {
    try {
      const { id } = req.params;

      // Get company for the authenticated user
      const [companies] = await pool.execute(
        "SELECT id FROM companies WHERE user_id = ?",
        [req.user.id],
      );

      if (companies.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Company not found",
        });
      }

      const companyId = companies[0].id;

      // Get current package status
      const [packages] = await pool.execute(
        "SELECT is_active FROM packages WHERE id = ? AND company_id = ?",
        [id, companyId],
      );

      if (packages.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      const newStatus = !packages[0].is_active;
      const packageData = await PackageService.updatePackage(id, companyId, {
        is_active: newStatus,
      });

      res.status(200).json({
        success: true,
        message: `Package ${newStatus ? "activated" : "deactivated"} successfully`,
        data: packageData,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
