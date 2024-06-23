import Joi from 'joi'

export const userSchema = Joi.object({
  userName: Joi.string().alphanum().min(3).max(32).required().trim(),
  email: Joi.string().max(40).lowercase().email().required().trim(),
  password: Joi.string().min(10).max(100).pattern(new RegExp('^[a-zA-Z0-9]{10,}$')).trim(),
})
