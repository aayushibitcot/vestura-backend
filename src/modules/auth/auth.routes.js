import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { signinSchema, signupSchema } from './auth.validation.js';

const router = Router();

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const err = new Error(error.details.map((d) => d.message).join(', '));
      err.name = 'ValidationError';
      err.status = 422;
      return next(err);
    }
    return next();
  };
}

router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/signin', validate(signinSchema), AuthController.signin);
router.get('/profile', authenticate, AuthController.profile);

export default router;
