"use strict";
const BaseRepository = require("./base.repository");
const Cart = require("../models/cart.model");

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findByUser(userId) {
    return this.findOne({ userId });
  }

  // Created lazily so callers never handle a missing cart.
  async findOrCreateByUser(userId) {
    const existing = await this.findOne({ userId });
    if (existing) return existing;
    return this.create({ userId, items: [] });
  }

  async saveItems(userId, items) {
    return this.model
      .findOneAndUpdate({ userId }, { items }, { new: true, upsert: true })
      .exec();
  }

  async clear(userId) {
    return this.model.findOneAndUpdate({ userId }, { items: [] }, { new: true }).exec();
  }
}

module.exports = new CartRepository();
