"use strict";
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    label:      { type: String, default: "Home" },
    line1:      { type: String, required: true },
    line2:      { type: String },
    city:       { type: String, required: true },
    province:   { type: String, required: true },
    postalCode: { type: String, required: true },
    country:    { type: String, required: true, default: "South Africa" },
    isDefault:  { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName:  { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },

    // select:false - excluded from queries unless explicitly requested.
    passwordHash: { type: String, required: true, select: false },

    role:      { type: String, enum: ["customer", "admin"], default: "customer" },

    // Bumped on logout to invalidate outstanding refresh tokens.
    tokenVersion: { type: Number, default: 0 },

    addresses: { type: [addressSchema], default: [] },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
