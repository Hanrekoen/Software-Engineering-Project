"use strict";
const BaseRepository = require("./base.repository");
const Cart = require("../models/cart.model");

// Person 3 owns the cart service and controller. This repository exists so the
// order service can read and clear a cart during checkout.
class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findByUser(userId) {
    return this.findOne({ userId });
  }

  async clear(userId) {
    return this.model.findOneAndUpdate({ userId }, { items: [] }, { new: true }).exec();
  }
}

module.exports = new CartRepository();
