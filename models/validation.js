const Joi = require('joi');

const registerValidation = data => {
  const schema = {
    name: Joi.string()
      .required()
      .min(6),
    email: Joi.string()
      .required()
      .min(6)
      .email(),
    password: Joi.string()
      .required()
      .min(6)
  };

  return Joi.validate(data, schema);
};

const loginValidation = data => {
  const schema = {
    email: Joi.string()
      .required()
      .min(6)
      .email(),
    password: Joi.string()
      .required()
      .min(6)
  };

  return Joi.validate(data, schema);
};

const updateValidation = data => {
  const schema = {
    name: Joi.string()
      .required()
      .min(6),
    email: Joi.string()
      .required()
      .min(6)
      .email(),
    password: Joi.string()
      .required()
      .min(6),
    image: Joi.string()
  };

  return Joi.validate(data, schema);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.updateValidation = updateValidation;
