import Joi from 'joi'

export const salonSchema = Joi.object({
  name: Joi.string().required().min(2).trim(),
  description: Joi.string().required().min(2).trim(),
  address: Joi.string().required().min(2).trim(),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .required()
    .trim(),
  opening_hours: Joi.string().required().min(2).trim(),
  website: Joi.string().optional().trim(),
})
