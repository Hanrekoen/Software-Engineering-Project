"use strict";
const cartService = require("../services/cart.service");
const { ok, created } = require("../utils/response");

// userId comes from the verified token, never the URL.

async function getCart(req, res) {
  return ok(res, await cartService.getCart(req.user.id));
}

async function addItem(req, res) {
  const { productId, quantity, finish } = req.body;
  const cart = await cartService.addItem(req.user.id, {
    productId,
    quantity: Number(quantity),
    finish,
  });
  return created(res, cart);
}

async function updateQuantity(req, res) {
  const cart = await cartService.updateQuantity(
    req.user.id,
    req.params.productId,
    Number(req.body.quantity)
  );
  return ok(res, cart);
}

async function removeItem(req, res) {
  return ok(res, await cartService.removeItem(req.user.id, req.params.productId));
}

async function clear(req, res) {
  return ok(res, await cartService.clear(req.user.id));
}

module.exports = { getCart, addItem, updateQuantity, removeItem, clear };
