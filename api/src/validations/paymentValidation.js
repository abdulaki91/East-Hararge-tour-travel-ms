import Joi from "joi";

export const createPaymentValidation = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    "number.base": "Amount must be a number",
    "number.positive": "Amount must be greater than 0",
    "any.required": "Amount is required",
  }),
  payment_method: Joi.string()
    .valid("demo", "telebirr", "chapa", "bank_transfer")
    .required()
    .messages({
      "any.only":
        "Payment method must be one of: demo, telebirr, chapa, bank_transfer",
      "any.required": "Payment method is required",
    }),
  user_phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  return_url: Joi.string().uri().optional().messages({
    "string.uri": "Return URL must be a valid URL",
  }),
});

export const processPaymentValidation = Joi.object({
  success: Joi.boolean().default(true).messages({
    "boolean.base": "Success must be a boolean value",
  }),
});

export const paymentQueryValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  status: Joi.string()
    .valid("pending", "completed", "failed", "refunded")
    .optional(),
  sort_by: Joi.string()
    .valid("created_at", "amount", "payment_date")
    .default("created_at"),
  sort_order: Joi.string().valid("asc", "desc").default("desc"),
});
