import Joi from 'joi';

export const validateSignup = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
    dateOfBirth: Joi.date().max('now').required().messages({
      'date.base': 'Please enter a valid date of birth',
      'date.max': 'Date of birth cannot be in the future',
      'any.required': 'Date of birth is required'
    })
  });

  return schema.validate(data);
};

export const validateOTPSignin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
    otp: Joi.string().length(6).required().messages({
      'string.empty': 'OTP is required',
      'string.length': 'OTP must be 6 digits'
    })
  });

  return schema.validate(data);
};

export const validateNote = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'Title is required',
      'string.max': 'Title cannot exceed 100 characters'
    }),
    content: Joi.string().min(1).max(5000).required().messages({
      'string.empty': 'Content is required',
      'string.max': 'Content cannot exceed 5000 characters'
    })
  });

  return schema.validate(data);
};
