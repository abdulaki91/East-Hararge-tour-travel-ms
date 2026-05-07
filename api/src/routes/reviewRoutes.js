import express from "express";
import { ReviewController } from "../controllers/reviewController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validation.js";
import {
  createReviewValidation,
  updateReviewValidation,
  reviewQueryValidation,
} from "../validations/reviewValidation.js";
import Joi from "joi";

const router = express.Router();

const idValidation = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const packageIdValidation = Joi.object({
  packageId: Joi.number().integer().positive().required(),
});

// User routes
router.post(
  "/",
  authenticate,
  authorize("USER"),
  validate(createReviewValidation),
  ReviewController.createReview,
);

router.get(
  "/my",
  authenticate,
  authorize("USER"),
  validateQuery(reviewQueryValidation),
  ReviewController.getMyReviews,
);

router.put(
  "/:id",
  authenticate,
  authorize("USER"),
  validateParams(idValidation),
  validate(updateReviewValidation),
  ReviewController.updateReview,
);

router.delete(
  "/:id",
  authenticate,
  authorize("USER"),
  validateParams(idValidation),
  ReviewController.deleteReview,
);

// Public routes
router.get(
  "/package/:packageId",
  validateParams(packageIdValidation),
  validateQuery(reviewQueryValidation),
  ReviewController.getPackageReviews,
);

// Company routes
router.get(
  "/company/my",
  authenticate,
  authorize("COMPANY"),
  validateQuery(reviewQueryValidation),
  ReviewController.getCompanyReviews,
);

export default router;
