import { AuthService } from "../services/authService.js";

export class AuthController {
  static async register(req, res) {
    try {
      const result = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async registerCompany(req, res) {
    try {
      const userId = req.user.id;
      const company = await AuthService.registerCompany(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Company registered successfully",
        data: company,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = req.user;

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          profile_image: user.profile_image,
          role: user.role_name, // For backward compatibility
          role_name: user.role_name, // For new frontend code
          is_active: user.is_active,
          email_verified: user.email_verified,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
