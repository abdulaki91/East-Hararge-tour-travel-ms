import Joi from "joi";

export const createBookingValidation = Joi.object({
  package_id: Joi.number().integer().positive().required().messages({
    "number.base": "Package ID must be a number",
    "number.integer": "Package ID must be a whole number",
    "number.positive": "Package ID must be positive",
    "any.required": "Package ID is required",
  }),
  number_of_people: Joi.number().integer().min(1).max(100).required().messages({
    "number.base": "Number of people must be a number",
    "number.integer": "Number of people must be a whole number",
    "number.min": "At least 1 person is required",
    "number.max": "Cannot book for more than 100 people",
    "any.required": "Number of people is required",
  }),
  booking_date: Joi.date().min("now").required().messages({
    "date.base": "Booking date must be a valid date",
    "date.min": "Booking date cannot be in the past",
    "any.required": "Booking date is required",
  }),
  special_requests: Joi.string().max(1000).allow("").optional().messages({
    "string.max": "Special requests cannot exceed 1000 characters",
  }),
});

export const updateBookingValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "completed")
    .optional(),
  special_requests: Joi.string().max(1000).optional(),
});

export const bookingQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "completed")
    .optional(),
  payment_status: Joi.string()
    .valid("pending", "completed", "failed", "refunded")
    .optional(),
  sort_by: Joi.string()
    .valid("created_at", "booking_date", "total_amount")
    .default("created_at"),
  sort_order: Joi.string().valid("asc", "desc").default("desc"),
});
