"use strict";

// Factory: the only place an order document is constructed.
// Change TAX_RATE to 0.15 for South African VAT.
const SHIPPING_FLAT_CENTS = 0;
const TAX_RATE = 0.08;

function generateOrderNumber(now = new Date()) {
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `ORD-${year}-${random}`;
}

function buildOrder({ userId, cartItems, products, shippingAddress }) {
  const items = cartItems.map((cartItem) => {
    const product = products.find(
      (p) => String(p._id) === String(cartItem.productId)
    );
    if (!product) {
      throw new Error(`Product ${cartItem.productId} missing while building order`);
    }
    return {
      productId:      product._id,
      name:           product.name,        // copied, not referenced
      finish:         cartItem.finish,
      unitPriceCents: product.priceCents,  // copied, not referenced
      quantity:       cartItem.quantity,
    };
  });

  // Totals come from the database price only - never from the client.
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );
  const shippingCents = SHIPPING_FLAT_CENTS;
  const taxCents = Math.round(subtotalCents * TAX_RATE);

  return {
    orderNumber: generateOrderNumber(),
    userId,
    items,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + shippingCents + taxCents,
    status: "pending",
    shippingAddress,
  };
}

module.exports = { buildOrder, generateOrderNumber, SHIPPING_FLAT_CENTS, TAX_RATE };
