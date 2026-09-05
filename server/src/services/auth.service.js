"use strict";
const crypto = require("crypto");
const userRepository = require("../repositories/user.repository");
const { hashPassword, comparePassword } = require("../utils/password");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { ConflictError, UnauthorizedError } = require("../errors/AppError");

// Business rules for authentication. No req, res or Mongoose in this layer.

// The one place a user is sanitised before leaving the service.
function toPublicUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function issueTokens(user) {
  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  // jti keeps every refresh token unique, even when issued in the same second.
  const refreshToken = signRefreshToken({
    id: user._id.toString(),
    tokenVersion: user.tokenVersion,
    jti: crypto.randomUUID(),
  });
  return { accessToken, refreshToken };
}

async function register({ firstName, lastName, email, password }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw new ConflictError("An account with that email already exists");

  const passwordHash = await hashPassword(password);
  const user = await userRepository.create({ firstName, lastName, email, passwordHash });

  return { user: toPublicUser(user), ...issueTokens(user) };
}

async function login(email, password) {
  const user = await userRepository.findByEmailWithPassword(email);

  // One message for both failures - distinguishing them enables enumeration.
  const invalid = () => new UnauthorizedError("Invalid email or password");
  if (!user || !user.isActive) throw invalid();

  const matches = await comparePassword(password, user.passwordHash);
  if (!matches) throw invalid();

  return { user: toPublicUser(user), ...issueTokens(user) };
}

// Exchanges a refresh token for a new pair, rotating the refresh token.
async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await userRepository.findById(payload.id);

  // A tokenVersion mismatch means the user has logged out since.
  if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
    throw new UnauthorizedError("Session is no longer valid");
  }

  return issueTokens(user);
}

// Bumping tokenVersion invalidates every outstanding refresh token.
async function logout(userId) {
  await userRepository.incrementTokenVersion(userId);
}

module.exports = { register, login, refresh, logout, toPublicUser };
