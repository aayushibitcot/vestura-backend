import { CartService } from './cart.service.js';
import { successResponse } from '../../utils/response.util.js';

export const CartController = {
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;
      const cart = await CartService.getCart(userId);
      return successResponse(res, 'Cart fetched successfully', cart);
    } catch (err) {
      return next(err);
    }
  },

  async addItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { productSku, quantity, selectedSize, selectedColor } = req.body;
      const cart = await CartService.addItem(userId, productSku, quantity, selectedSize, selectedColor);
      // Return only id, items, and total as per API spec
      return successResponse(res, 'Item added to cart', {
        id: cart.id,
        items: cart.items,
        total: cart.total,
      });
    } catch (err) {
      return next(err);
    }
  },

  async updateItemQuantity(req, res, next) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const { quantity } = req.body;

      // Extract numeric ID from cart_item_XXX format or use numeric ID directly
      let numericId;
      const idMatch = itemId.match(/^cart_item_(\d+)$/);
      if (idMatch) {
        numericId = parseInt(idMatch[1], 10);
      } else if (/^\d+$/.test(itemId)) {
        numericId = parseInt(itemId, 10);
      } else {
        const err = new Error('Invalid item ID format');
        err.name = 'ValidationError';
        err.status = 400;
        throw err;
      }

      const cart = await CartService.updateItemQuantity(userId, numericId, quantity);
      // Return only id, items, and total as per API spec
      return successResponse(res, 'Cart item updated', {
        id: cart.id,
        items: cart.items,
        total: cart.total,
      });
    } catch (err) {
      return next(err);
    }
  },

  async removeItem(req, res, next) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;

      // Extract numeric ID from cart_item_XXX format or use numeric ID directly
      let numericId;
      const idMatch = itemId.match(/^cart_item_(\d+)$/);
      if (idMatch) {
        numericId = parseInt(idMatch[1], 10);
      } else if (/^\d+$/.test(itemId)) {
        numericId = parseInt(itemId, 10);
      } else {
        const err = new Error('Invalid item ID format');
        err.name = 'ValidationError';
        err.status = 400;
        throw err;
      }

      const cart = await CartService.removeItem(userId, numericId);
      // Return only id, items, and total as per API spec
      return successResponse(res, 'Item removed from cart', {
        id: cart.id,
        items: cart.items,
        total: cart.total,
      });
    } catch (err) {
      return next(err);
    }
  },

  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      await CartService.clearCart(userId);
      return successResponse(res, 'Cart cleared successfully');
    } catch (err) {
      return next(err);
    }
  },
};

