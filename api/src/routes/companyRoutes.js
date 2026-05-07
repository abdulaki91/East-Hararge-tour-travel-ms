import express from "express";
import { CompanyController } from "../controllers/companyController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validation.js";
import Joi from "joi";

const router = express.Router();

// Validation schemas
const registerCompanyValidation = Joi.object({
  company_name: Joi.string().required().max(255),
  business_license: Joi.string().max(255).optional(),
  address: Joi.string().max(500).optional(),
  description: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  phone: Joi.string().max(20).optional(),
  email: Joi.string().email().optional(),
});

const updateCompanyValidation = Joi.object({
  company_name: Joi.string().max(255).optional(),
  business_license: Joi.string().max(255).optional(),
  address: Joi.string().max(500).optional(),
  description: Joi.string().max(1000).optional(),
  website: Joi.string().uri().optional(),
  phone: Joi.string().max(20).optional(),
  email: Joi.string().email().optional(),
});

// Register company (for users without company)
router.post(
  "/register",
  authenticate,
  validate(registerCompanyValidation),
  CompanyController.registerCompany,
);

// Get my company
router.get("/me", authenticate, CompanyController.getMyCompany);

// Update company profile
router.put(
  "/me",
  authenticate,
  authorize("COMPANY"),
  validate(updateCompanyValidation),
  CompanyController.updateCompany,
);

// Get company statistics
router.get(
  "/stats",
  authenticate,
  authorize("COMPANY"),
  CompanyController.getCompanyStats,
);

export default router;
