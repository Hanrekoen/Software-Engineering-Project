"use strict";
const orderRepository = require("../repositories/order.repository");
const cartRepository = require("../repositories/cart.repository");
const productRepository = require("../repositories/product.repository");
const orderFactory = require("./order.factory");
const {
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} = require("../errors/AppError");

// Allowed status transitions. Anything else is rejected with 422 (FR-10).
const TRANSITIONS = {
  pending:   ["paid", "cancelled"],
  paid:      ["shipped", "cancelled"],
  shipped:   ["delivered"],
  delivered: [],
  cancelled: [],
};

// Checkout: validate the cart, decrement stock atomically, build the order,
// empty the cart. Any failure puts back whatever stock was already taken.
async function checkout(userId, shippingAddress) {
  const cart = await cartRepository.findByUser(userId);
  if (!cart || cart.items.length === 0) {
    throw new BusinessRuleError("Your cart is empty");
  }

  const productIds = cart.items.map((item) => item.productId);
  const products = await productRepository.findManyByIds(productIds);

  if (products.length !== cart.items.length) {
    throw new BusinessRuleError("One or more products in your cart no longer exist");
  }
  const inactive = products.find((p) => !p.isActive);
  if (inactive) {
    throw new BusinessRuleError(`${inactive.name} is no longer available`);
  }

  // Manual compensation - no replica-set transactions on the free tier.
  const decremented = [];
  try {
    for (const item of cart.items) {
      const result = await productRepository.decrementStock(item.productId, item.quantity);
      if (!result) {
        const product = products.find((p) => String(p._id) === String(item.productId));
        throw new BusinessRuleError(
          `Not enough stock for ${product ? product.name : "an item"}`
        );
      }
      decremented.push(item);
    }

    const orderData = orderFactory.buildOrder({
      userId,
      cartItems: cart.items,
      products,
      shippingAddress,
    });

    const order = await orderRepository.create(orderData);
    await cartRepository.clear(userId);
    return order;
  } catch (err) {
    for (const item of decremented) {
      await productRepository.incrementStock(item.productId, item.quantity);
    }
    throw err;
  }
}

async function listForUser(userId, { page, limit } = {}) {
  return orderRepository.findByUser(userId, { page, limit });
}

// Ownership is re-checked rather than trusting the id in the URL.
async function getForUser(orderId, userId) {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError("Order");
  if (String(order.userId) !== String(userId)) {
    throw new ForbiddenError("That order does not belong to you");
  }
  return order;
}

async function listAll({ status, page, limit } = {}) {
  return orderRepository.findAll({ status, page, limit });
}

async function updateStatus(orderId, nextStatus) {
  const order = await orderRepository.findById(orderId);
  if (!order) throw new NotFoundError("Order");

  const allowed = TRANSITIONS[order.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw new BusinessRuleError(
      `Cannot move an order from ${order.status} to ${nextStatus}`
    );
  }

  // Return stock when an order is cancelled.
  if (nextStatus === "cancelled") {
    for (const item of order.items) {
      await productRepository.incrementStock(item.productId, item.quantity);
    }
  }

  return orderRepository.setStatus(orderId, nextStatus);
}

module.exports = {
  checkout,
  listForUser,
  getForUser,
  listAll,
  updateStatus,
  TRANSITIONS,
};
