import { prisma } from '../../config/db.js';

export const CartModel = {
  findByUserId: (userId) => prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  }),

  create: (userId) => prisma.cart.create({
    data: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  }),

  findCartItemById: (itemId) => prisma.cartItem.findUnique({
    where: { id: itemId },
    include: {
      cart: true,
      product: {
        include: {
          category: true,
        },
      },
    },
  }),

  addItem: (cartId, productId, quantity, selectedSize, selectedColor) => prisma.cartItem.create({
    data: {
      cartId,
      productId,
      quantity,
      selectedSize,
      selectedColor,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  }),

  updateItemQuantity: (itemId, quantity) => prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  }),

  deleteItem: (itemId) => prisma.cartItem.delete({
    where: { id: itemId },
  }),

  clearCart: (cartId) => prisma.cartItem.deleteMany({
    where: { cartId },
  }),

  findItemByCartAndProduct: (cartId, productId, selectedSize, selectedColor) => prisma.cartItem.findFirst({
    where: {
      cartId,
      productId,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  }),
};


