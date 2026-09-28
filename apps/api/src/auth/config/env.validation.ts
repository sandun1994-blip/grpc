import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  GRPC_IDENTITY_URL: Joi.string().required(),
  PORT: Joi.number().default(3000),
});
