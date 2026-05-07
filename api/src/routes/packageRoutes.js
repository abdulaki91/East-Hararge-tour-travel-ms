import express from "express";
import { PackageController } from "../controllers/packageController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  uploadPackageImages,
  handleUploadError,
} from "../middlewares/upload.js";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validation.js";
import {
  createPackageValidation,
  updatePackageValidation,
  packageQueryValidation,
} from "../validations/packageValidation.js";
import Joi from "joi";

const router = express.Router();

const idValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// Middleware to parse JSON fields from FormData
const parseFormDataJSON = (req, res, next) => {
  if (req.body.itinerary && typeof req.body.itinerary === "string") {
    try {
      req.body.itinerary = JSON.parse(req.body.itinerary);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "Invalid itinerary format",
      });
    }
  }
  next();
};

// Public routes
router.get(
  "/",
  validateQuery(packageQueryValidation),
  PackageController.getPackages,
);
router.get(
  "/:id",
  validateParams(idValidation),
  PackageController.getPackageById,
);

// Company routes
router.post(
  "/",
  authenticate,
  authorize("COMPANY"),
  uploadPackageImages,
  handleUploadError,
  parseFormDataJSON,
  validate(createPackageValidation),
  PackageController.createPackage,
);

router.put(
  "/:id",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  uploadPackageImages,
  handleUploadError,
  parseFormDataJSON,
  validate(updatePackageValidation),
  PackageController.updatePackage,
);

router.delete(
  "/:id",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  PackageController.deletePackage,
);

router.get(
  "/my/packages",
  authenticate,
  authorize("COMPANY"),
  validateQuery(packageQueryValidation),
  PackageController.getMyPackages,
);

router.patch(
  "/:id/toggle-status",
  authenticate,
  authorize("COMPANY"),
  validateParams(idValidation),
  PackageController.togglePackageStatus,
);

export default router;
