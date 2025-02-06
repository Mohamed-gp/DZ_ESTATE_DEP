import Joi from "joi";

const validateCreateProperty = (obj: any) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required().messages({
      "string.min": "Title must be at least 5 characters",
      "string.max": "Title cannot exceed 255 characters",
      "any.required": "Title is required",
    }),
    description: Joi.string().min(10).max(500).required().messages({
      "string.min": "Description must be at least 10 characters",
      "string.max": "Description cannot exceed 500 characters",
      "any.required": "Description is required",
    }),
    price: Joi.number().min(0).required().messages({
      "number.min": "Price must be a positive number",
      "any.required": "Price is required",
    }),
    status: Joi.string().valid("rent", "sell").required().messages({
      "any.only": "Please select a valid property type",
      "any.required": "Status is required",
    }),
    commune: Joi.string().min(1).required().messages({
      "string.min": "Commune is required",
      "any.required": "Commune is required",
    }),
    quartier: Joi.string().min(1).required().messages({
      "string.min": "Quartier is required",
      "any.required": "Quartier is required",
    }),
    wilaya: Joi.number().min(1).max(58).required().messages({
      "number.min": "Wilaya is required",
      "number.max": "Wilaya must be between 1 and 58",
      "any.required": "Wilaya is required",
    }),
    longitude: Joi.number().required().messages({
      "any.required": "Longitude is required",
    }),
    latitude: Joi.number().required().messages({
      "any.required": "Latitude is required",
    }),
    guests: Joi.number().min(1).required().messages({
      "number.min": "Guests must be greater than 0",
      "any.required": "Guests is required",
    }),
    bedrooms: Joi.number().min(0).required().messages({
      "number.min": "Bedrooms cannot be negative",
      "any.required": "Bedrooms is required",
    }),
    bathrooms: Joi.number().min(0).required().messages({
      "number.min": "Bathrooms cannot be negative",
      "any.required": "Bathrooms is required",
    }),
    category: Joi.number().required().messages({
      "any.required": "Category is required",
    }),
    features: Joi.array().items(Joi.number().required()).required().messages({
      "any.required": "Features are required",
    }),
    files: Joi.array().items(Joi.object().instance(File)).optional(),
  });

  return schema.validate(obj);
};
export { validateCreateProperty };
