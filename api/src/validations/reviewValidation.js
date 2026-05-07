import Joi from "joi";

export const createReviewValidation = Joi.object({
  package_id: Joi.number().integer().positive().required().messages({
    "number.base": "Package ID must be a number",
    "number.integer": "Package ID must be a whole number",
    "number.positive": "Package ID must be positive",
    "any.required": "Package ID is required",
  }),
  booking_id: Joi.number().integer().positive().required().messages({
    "number.base": "Booking ID must be a number",
    "number.integer": "Booking ID must be a whole number",
    "number.positive": "Booking ID must be positive",
    "any.required": "Booking ID is required",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.integer": "Rating must be a whole number",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),
  comment: Joi.string().min(10).max(1000).optional().messages({
    "string.min": "Comment must be at least 10 characters long",
    "string.max": "Comment cannot exceed 1000 characters",
  }),
});

export const updateReviewValidation = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.base": "Rating must be a number",
    "number.integer": "Rating must be a whole number",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
  }),
  comment: Joi.string().min(10).max(1000).optional().messages({
    "string.min": "Comment must be at least 10 characters long",
    "string.max": "Comment cannot exceed 1000 characters",
  }),
});

export const reviewQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort_by: Joi.string().valid("created_at", "rating").default("created_at"),
  sort_order: Joi.string().valid("asc", "desc").default("desc"),
});
