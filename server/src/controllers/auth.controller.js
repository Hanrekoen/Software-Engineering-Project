"use strict";
const authService = require("../services/auth.service");
const { ok, created, noContent } = require("../utils/response");
const env = require("../config/env");

// HTTP only. The refresh token goes in an httpOnly cookie so script on the
// page cannot read it; the access token is returned in the body.

const REFRESH_COOKIE = "refreshToken";

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    path: "/api/auth", // sent only to auth endpoints
    maxAge: 7 * 24 * 60 * 60 * 1000, // keep in sync with REFRESH_TOKEN_TTL
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

async function register(req, res) {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  return created(res, { user, accessToken });
}

async function login(req, res) {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);
  setRefreshCookie(res, refreshToken);
  return ok(res, { user, accessToken });
}

async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE];
  const { accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken); // rotated - overwrite the old cookie
  return ok(res, { accessToken });
}

async function logout(req, res) {
  await authService.logout(req.user.id);
  clearRefreshCookie(res);
  return noContent(res);
}

module.exports = { register, login, refresh, logout };
