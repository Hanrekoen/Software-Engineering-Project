const jwt = require('jsonwebtoken');
 
/**
 * JWT Security approach (System Plan):
 * - two distinct secrets (access / refresh), never reused or shared
 *   across environments
 * - access token: short-lived, sent as Bearer token, carries id + role
 *   so authorization/role-filtering doesn't need an extra DB call
 * - refresh token: longer-lived, used only to mint a new access token
 */
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
}
 
function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}
 
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}
 
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};