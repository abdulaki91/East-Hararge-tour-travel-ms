import express from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validation.js";
import {
  registerValidation,
  loginValidation,
  companyRegistrationValidation,
} from "../validations/authValidation.js";
import { checkRegistrationEnabled } from "../middlewares/systemSettings.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  checkRegistrationEnabled,
  validate(registerValidation),
  AuthController.register,
);
router.post("/login", validate(loginValidation), AuthController.login);

// Protected routes
router.get("/profile", authenticate, AuthController.getProfile);
router.post(
  "/company/register",
  authenticate,
  authorize("COMPANY"),
  validate(companyRegistrationValidation),
  AuthController.registerCompany,
);

export default router;
