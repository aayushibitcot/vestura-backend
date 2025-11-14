import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { addItemSchema, updateItemQuantitySchema } from './cart.validation.js';

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

// All cart routes require authentication
router.use(authenticate);

router.get('/', CartController.getCart);
router.post('/items', validate(addItemSchema), CartController.addItem);
router.put('/items/:itemId', validate(updateItemQuantitySchema), CartController.updateItemQuantity);
router.delete('/items/:itemId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;

