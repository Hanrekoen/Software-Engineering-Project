"use strict";
const bcrypt = require("bcrypt");

// 12 rounds - the usual balance between cost per login and brute-force resistance.
const SALT_ROUNDS = 12;

async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

module.exports = { hashPassword, comparePassword };
