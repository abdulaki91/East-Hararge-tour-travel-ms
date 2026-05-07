import Joi from "joi";

export const createPackageValidation = Joi.object({
  title: Joi.string().min(5).max(255).required().messages({
    "string.min": "Package title must be at least 5 characters long",
    "string.max": "Package title cannot exceed 255 characters",
    "any.required": "Package title is required",
  }),
  description: Joi.string().min(20).required().messages({
    "string.min": "Description must be at least 20 characters long",
    "any.required": "Description is required",
  }),
  location: Joi.string().min(2).max(255).required().messages({
    "string.min": "Location must be at least 2 characters long",
    "string.max": "Location cannot exceed 255 characters",
    "any.required": "Location is required",
  }),
  duration_days: Joi.number().integer().min(1).max(365).required().messages({
    "number.base": "Duration must be a number",
    "number.integer": "Duration must be a whole number",
    "number.min": "Duration must be at least 1 day",
    "number.max": "Duration cannot exceed 365 days",
    "any.required": "Duration is required",
  }),
  price: Joi.number().positive().precision(2).required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required",
  }),
  max_people: Joi.number().integer().min(1).max(100).required().messages({
    "number.base": "Max people must be a number",
    "number.integer": "Max people must be a whole number",
    "number.min": "Max people must be at least 1",
    "number.max": "Max people cannot exceed 100",
    "any.required": "Max people is required",
  }),
  available_slots: Joi.number().integer().min(0).required().messages({
    "number.base": "Available slots must be a number",
    "number.integer": "Available slots must be a whole number",
    "number.min": "Available slots cannot be negative",
    "any.required": "Available slots is required",
  }),
  start_date: Joi.date().min("now").required().messages({
    "date.base": "Start date must be a valid date",
    "date.min": "Start date cannot be in the past",
    "any.required": "Start date is required",
  }),
  end_date: Joi.date().greater(Joi.ref("start_date")).required().messages({
    "date.base": "End date must be a valid date",
    "date.greater": "End date must be after start date",
    "any.required": "End date is required",
  }),
  includes: Joi.string().optional(),
  excludes: Joi.string().optional(),
  itinerary: Joi.array()
    .items(
      Joi.object({
        day: Joi.number().integer().min(1).required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        activities: Joi.array().items(Joi.string()).optional(),
      }),
    )
    .optional(),
});

export const updatePackageValidation = Joi.object({
  title: Joi.string().min(5).max(255).optional(),
  description: Joi.string().min(20).optional(),
  location: Joi.string().min(2).max(255).optional(),
  duration_days: Joi.number().integer().min(1).max(365).optional(),
  price: Joi.number().positive().precision(2).optional(),
  max_people: Joi.number().integer().min(1).max(100).optional(),
  available_slots: Joi.number().integer().min(0).optional(),
  start_date: Joi.date().min("now").optional(),
  end_date: Joi.date().optional(),
  includes: Joi.string().optional(),
  excludes: Joi.string().optional(),
  itinerary: Joi.array()
    .items(
      Joi.object({
        day: Joi.number().integer().min(1).required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        activities: Joi.array().items(Joi.string()).optional(),
      }),
    )
    .optional(),
  is_active: Joi.boolean().optional(),
});

export const packageQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  location: Joi.string().optional(),
  min_price: Joi.number().positive().optional(),
  max_price: Joi.number().positive().optional(),
  duration: Joi.number().integer().min(1).optional(),
  sort_by: Joi.string()
    .valid("price", "duration", "duration_days", "created_at", "title", "rating")
    .default("created_at"),
  sort_order: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().optional(),
});
