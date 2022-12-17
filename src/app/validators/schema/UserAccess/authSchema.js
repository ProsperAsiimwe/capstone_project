const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(6)
    .max(50)
    .messages({
      'any.string': 'Your username is required',
      'any.required': 'Username is a required field',
      'any.min': 'Enter a valid username',
      max: 'Enter a valid username',
    })
    .label('Invalid username'),
  password: Joi.string().required().min(6).max(20).messages({
    'any.string': 'Your password must be a string',
    'any.required': 'Password is a required field',
  }),
});

const searchUserSchema = Joi.object({
  email: Joi.string()
    .required()
    .min(3)
    .max(50)
    .messages({
      'any.string': 'Your email is required',
      'any.required': 'Email is a required field',
      'any.min': 'Enter a valid email',
      'any.max': 'Enter a valid email',
    })
    .label('Invalid email'),
});

const studentLoginSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(6)
    .max(15)
    .messages({
      'any.string': 'Your username is required',
      'any.required': 'Username is a required field',
      'any.min': 'Enter a valid username',
      max: 'Enter a valid username',
      pattern: 'Enter a valid username',
    })
    .label('Invalid username'),
  password: Joi.string().required().min(6).max(20).messages({
    'any.string': 'Your password must be a string',
    'any.required': 'Password is a required field',
  }),
});

const requestOTPStudentSchema = Joi.object({
  username: Joi.string().required().min(6).max(15).messages({
    'any.string': 'Your username is required',
    'any.required': 'Username is a required field',
    'any.min': 'Enter a valid username',
    'any.max': 'Enter a valid username',
  }),
});

const resetPasswordSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(6)
    .max(50)
    .messages({
      'any.string': 'Your username is required',
      'any.required': 'Username is a required field',
      'any.min': 'Enter a valid username',
      'any.max': 'Enter a valid username',
    })
    .label('Invalid username'),
  new_password: Joi.string()
    .required()
    .min(6)
    .max(16)
    .messages({
      'any.string': 'Your username is required',
      'any.required': 'Username is a required field',
      'any.min': 'Enter a valid password',
      'any.max': 'Enter a valid password',
    })
    .label('Invalid New Password'),
  confirm_password: Joi.ref('new_password'),
  otp: Joi.number().required().messages({
    'any.number': 'Invalid OTP',
    'any.required': 'OTP is a required field',
    'any.min': 'Enter a valid OTP',
    'any.max': 'Enter a valid OTP',
  }),
});

const resetStudentPasswordSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(6)
    .max(15)
    .messages({
      'any.string': 'Your username is required',
      'any.required': 'Username is a required field',
      'any.min': 'Enter a valid username',
      'any.max': 'Enter a valid username',
    })
    .label('Invalid username'),
  new_password: Joi.string()
    .required()
    .min(6)
    .max(16)
    .messages({
      'any.string': 'Your username is required',
      'any.required': 'Username is a required field',
      'any.min': 'Enter a valid password',
      'any.max': 'Enter a valid password',
    })
    .label('Invalid New Password'),
  confirm_password: Joi.ref('new_password'),
  otp_code: Joi.number().required().messages({
    'any.number': 'Invalid OTP',
    'any.required': 'OTP is a required field',
    'any.min': 'Enter a valid OTP',
    'any.max': 'Enter a valid OTP',
  }),
});

const changePasswordSchema = Joi.object({
  old_password: Joi.string().required().trim().max(16),
  new_password: Joi.string()
    .required()
    .trim()
    .min(6)
    .max(16)
    .messages({
      'any.string': 'Your username is required',
      'any.required': 'Username is a required field',
      'any.min': 'Enter a valid password',
      'any.max': 'Enter a valid password',
    })
    .label('Invalid new password'),
  confirm_password: Joi.ref('new_password'),
});

const requestOTPSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(6)
    .max(50)
    .messages({
      'any.string': 'Your username is required',
      'any.required': 'Username is a required field',
      'any.min': 'Enter a valid username',
      'any.max': 'Enter a valid username',
    })
    .label('Invalid username'),
  account_type: Joi.string(),
  staff_origin: Joi.string(),
});

const changeDefaultPasswordSchema = Joi.object({
  new_password: Joi.string().required().trim().min(6).max(16),
  confirm_password: Joi.ref('new_password'),
});

const editStudentContactsSchema = Joi.object({
  phone: Joi.string(),
  email: Joi.string(),
});

module.exports = {
  loginSchema,
  studentLoginSchema,
  changePasswordSchema,
  changeDefaultPasswordSchema,
  resetStudentPasswordSchema,
  requestOTPSchema,
  searchUserSchema,
  resetPasswordSchema,
  requestOTPStudentSchema,
  editStudentContactsSchema,
};
