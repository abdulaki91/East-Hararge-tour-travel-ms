import Joi from "joi";

export const registerValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s-()]+$/)
    .allow("", null)
    .optional()
    .empty("")
    .default(null)
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  role: Joi.string().valid("USER", "COMPANY").default("USER"),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const companyRegistrationValidation = Joi.object({
  company_name: Joi.string().min(2).max(255).required().messages({
    "string.min": "Company name must be at least 2 characters long",
    "string.max": "Company name cannot exceed 255 characters",
    "any.required": "Company name is required",
  }),
  description: Joi.string().max(1000).optional(),
  address: Joi.string().max(500).optional(),
  phone: Joi.string()
    .pattern(/^[+]?[\d\s-()]+$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  email: Joi.string().email().optional().messages({
    "string.email": "Please provide a valid email address",
  }),
  website: Joi.string().uri().optional().messages({
    "string.uri": "Please provide a valid website URL",
  }),
  license_number: Joi.string().max(100).optional(),
});
