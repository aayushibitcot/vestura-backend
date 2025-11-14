// Utility functions to format cart data according to API spec

export function formatCartItem(cartItem) {
  const product = cartItem.product;
  const price = parseFloat(product.price);
  const quantity = cartItem.quantity;
  const subtotal = price * quantity;

  return {
    id: `cart_item_${cartItem.id}`,
    product: {
      sku: `PROD-${String(product.id).padStart(3, '0')}`,
      name: product.name,
      price,
      currency: 'USD',
      image: product.image || null,
    },
    quantity,
    selectedSize: cartItem.selectedSize || null,
    selectedColor: cartItem.selectedColor || null,
    subtotal,
  };
}

export function formatCart(cart) {
  if (!cart) {
    return {
      id: null,
      userId: null,
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const items = (cart.items || []).map(formatCartItem);
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = 0; // Can be calculated based on business logic
  const tax = 0; // Can be calculated based on business logic
  const total = subtotal + shipping + tax;

  return {
    id: `cart_${cart.id}`,
    userId: `user_${cart.userId}`,
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}


