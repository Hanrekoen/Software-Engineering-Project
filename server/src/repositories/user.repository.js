"use strict";
const BaseRepository = require("./base.repository");
const User = require("../models/user.model");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  // Login needs the hash, which is select:false on the schema.
  async findByEmailWithPassword(email) {
    return this.model.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash").exec();
  }

  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase().trim() });
  }

  // Bumped on logout to invalidate outstanding refresh tokens.
  async incrementTokenVersion(userId) {
    return this.model.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } }, { new: true }).exec();
  }
}

module.exports = new UserRepository();
