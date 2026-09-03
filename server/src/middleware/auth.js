"use strict";
const { verifyAccessToken } = require("../utils/jwt");
const { UnauthorizedError, ForbiddenError } = require("../errors/AppError");

// Verifies the Bearer token and attaches { id, role } to req.user.
// Never hits the database - the token payload carries what a request needs.
function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new UnauthorizedError("Authentication required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.id, role: payload.role };
    return next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
}

// Role gate. Runs after authenticate; accepts one or more roles.
function requireRole(...roles) {
  return function (req, _res, next) {
    if (!req.user) return next(new UnauthorizedError("Authentication required"));
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("You do not have permission to do that"));
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
