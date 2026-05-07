import pool from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import { generateTokens } from "../utils/jwt.js";

export class AuthService {
  static async register(userData) {
    const { email, password, name, phone, role } = userData;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      throw new Error("User with this email already exists");
    }

    // Get role ID
    const [roles] = await pool.execute("SELECT id FROM roles WHERE name = ?", [
      role || "USER",
    ]);

    if (roles.length === 0) {
      throw new Error("Invalid role specified");
    }

    const roleId = roles[0].id;
    const hashedPassword = await hashPassword(password);

    // Create user
    const [result] = await pool.execute(
      `INSERT INTO users (email, password, name, phone, role_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, phone || null, roleId],
    );

    const userId = result.insertId;

    // Get created user with role
    const [users] = await pool.execute(
      `SELECT u.id, u.email, u.name, u.phone, u.profile_image, 
              u.is_active, u.email_verified, u.created_at, r.name as role_name
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [userId],
    );

    const user = users[0];
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role_name,
    });

    return {
      user: {
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
      tokens,
    };
  }

  static async login(email, password) {
    // Get user with role
    const [users] = await pool.execute(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ? AND u.is_active = true`,
      [email],
    );

    if (users.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = users[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role_name,
    });

    return {
      user: {
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
      tokens,
    };
  }

  static async registerCompany(userId, companyData) {
    const {
      company_name,
      description,
      address,
      phone,
      email,
      website,
      license_number,
    } = companyData;

    // Check if user already has a company
    const [existingCompanies] = await pool.execute(
      "SELECT id FROM companies WHERE user_id = ?",
      [userId],
    );

    if (existingCompanies.length > 0) {
      throw new Error("User already has a company registered");
    }

    // Create company
    const [result] = await pool.execute(
      `INSERT INTO companies (user_id, company_name, description, address, phone, email, website, license_number) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        company_name,
        description,
        address,
        phone,
        email,
        website,
        license_number,
      ],
    );

    // Get created company
    const [companies] = await pool.execute(
      "SELECT * FROM companies WHERE id = ?",
      [result.insertId],
    );

    return companies[0];
  }
}
