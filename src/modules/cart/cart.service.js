import { CartModel } from './cart.model.js';
import { prisma } from '../../config/db.js';
import { formatCart, formatCartItem } from './cart.util.js';

export const CartService = {
  async getCart(userId) {
    let cart = await CartModel.findByUserId(userId);

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await CartModel.create(userId);
    }

    return formatCart(cart);
  },

  async addItem(userId, productSku, quantity, selectedSize, selectedColor) {
    // Extract product ID from SKU
    const idMatch = productSku.match(/^PROD-(\d+)$/);
    if (!idMatch) {
      const err = new Error('Invalid SKU format');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    const productId = parseInt(idMatch[1], 10);

    // Get or create cart
    let cart = await CartModel.findByUserId(userId);
    if (!cart) {
      cart = await CartModel.create(userId);
    }

    // Check if product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      const err = new Error('Product not found');
      err.name = 'PRODUCT_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    if (!product.isActive) {
      const err = new Error('Product is not available');
      err.name = 'PRODUCT_NOT_AVAILABLE';
      err.status = 400;
      throw err;
    }

    if (product.stock < quantity) {
      const err = new Error(
        product.stock === 0 
          ? 'Product is out of stock' 
          : `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`
      );
      err.name = 'OUT_OF_STOCK';
      err.status = 400;
      throw err;
    }

    // Validate size and color (both are now required)
    if (!selectedSize || selectedSize.trim() === '') {
      const err = new Error('selectedSize is required');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    if (!selectedColor || selectedColor.trim() === '') {
      const err = new Error('selectedColor is required');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    // Validate size against product's available sizes
    if (product.sizes && product.sizes.length > 0 && !product.sizes.includes(selectedSize)) {
      const err = new Error(`Invalid size selected. Available sizes: ${product.sizes.join(', ')}`);
      err.name = 'INVALID_SIZE';
      err.status = 400;
      throw err;
    }

    // Validate color against product's available colors
    if (product.colors && product.colors.length > 0 && !product.colors.includes(selectedColor)) {
      const err = new Error(`Invalid color selected. Available colors: ${product.colors.join(', ')}`);
      err.name = 'INVALID_COLOR';
      err.status = 400;
      throw err;
    }

    // Check if item already exists with same size and color
    const existingItem = await CartModel.findItemByCartAndProduct(
      cart.id,
      productId,
      selectedSize,
      selectedColor
    );

    let cartItem;
    if (existingItem) {
      // Update quantity if item already exists
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        const err = new Error(
          product.stock === 0 
            ? 'Product is out of stock' 
            : `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`
        );
        err.name = 'OUT_OF_STOCK';
        err.status = 400;
        throw err;
      }
      cartItem = await CartModel.updateItemQuantity(existingItem.id, newQuantity);
    } else {
      // Create new cart item
      cartItem = await CartModel.addItem(
        cart.id,
        productId,
        quantity,
        selectedSize || null,
        selectedColor || null
      );
    }

    // Refresh cart with all items
    const updatedCart = await CartModel.findByUserId(userId);
    return formatCart(updatedCart);
  },

  async updateItemQuantity(userId, itemId, quantity) {
    if (quantity <= 0) {
      const err = new Error('Quantity must be greater than 0');
      err.name = 'ValidationError';
      err.status = 400;
      throw err;
    }

    // Get cart item
    const cartItem = await CartModel.findCartItemById(itemId);
    if (!cartItem) {
      const err = new Error('Cart item not found');
      err.name = 'CART_ITEM_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
      const err = new Error('Unauthorized');
      err.name = 'UNAUTHORIZED';
      err.status = 403;
      throw err;
    }

    // Check stock availability
    if (cartItem.product.stock < quantity) {
      const err = new Error(
        cartItem.product.stock === 0 
          ? 'Product is out of stock' 
          : `Insufficient stock. Available: ${cartItem.product.stock}, Requested: ${quantity}`
      );
      err.name = 'OUT_OF_STOCK';
      err.status = 400;
      throw err;
    }

    // Update quantity
    await CartModel.updateItemQuantity(itemId, quantity);

    // Refresh cart
    const cart = await CartModel.findByUserId(userId);
    return formatCart(cart);
  },

  async removeItem(userId, itemId) {
    // Get cart item
    const cartItem = await CartModel.findCartItemById(itemId);
    if (!cartItem) {
      const err = new Error('Cart item not found');
      err.name = 'CART_ITEM_NOT_FOUND';
      err.status = 404;
      throw err;
    }

    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
      const err = new Error('Unauthorized');
      err.name = 'UNAUTHORIZED';
      err.status = 403;
      throw err;
    }

    // Delete item
    await CartModel.deleteItem(itemId);

    // Refresh cart
    const cart = await CartModel.findByUserId(userId);
    return formatCart(cart);
  },

  async clearCart(userId) {
    const cart = await CartModel.findByUserId(userId);
    if (!cart) {
      // Cart doesn't exist, nothing to clear
      return;
    }

    await CartModel.clearCart(cart.id);
  },
};


