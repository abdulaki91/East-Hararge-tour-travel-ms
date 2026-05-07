import Joi from "joi";

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: errorMessage,
      });
    }

    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);

    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: "Invalid parameters",
        error: errorMessage,
      });
    }

    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);

    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        error: errorMessage,
      });
    }

    next();
  };
};
