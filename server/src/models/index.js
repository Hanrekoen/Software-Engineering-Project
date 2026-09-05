"use strict";

// Registers all five models so .populate() works regardless of load order.

const User = require("./user.model");
const Category = require("./category.model");
const Product = require("./product.model");
const Cart = require("./cart.model");
const Order = require("./order.model");

module.exports = { User, Category, Product, Cart, Order };
