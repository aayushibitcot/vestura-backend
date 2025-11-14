import Joi from 'joi';

export const addItemSchema = Joi.object({
  productSku: Joi.string().pattern(/^PROD-\d+$/).required()
    .messages({
      'string.pattern.base': 'Invalid SKU format. Expected format: PROD-XXX',
      'any.required': 'productSku is required',
    }),
  quantity: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'quantity is required',
    }),
  selectedSize: Joi.string().trim().min(1).required()
    .messages({
      'string.base': 'selectedSize must be a string',
      'string.empty': 'selectedSize is required and cannot be empty',
      'string.min': 'selectedSize cannot be empty',
      'any.required': 'selectedSize is required',
    }),
  selectedColor: Joi.string().trim().min(1).required()
    .messages({
      'string.base': 'selectedColor must be a string',
      'string.empty': 'selectedColor is required and cannot be empty',
      'string.min': 'selectedColor cannot be empty',
      'any.required': 'selectedColor is required',
    }),
});

export const updateItemQuantitySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'quantity is required',
    }),
});


