"use strict";
const { AppError } = require("../errors/AppError");
const env = require("../config/env");

// PERSON 4 OWNS THIS FILE. Working baseline - improve it.
// Must be mounted LAST in app.js, after all routes.

module.exports = function errorHandler(err, req, res, _next) {
  let status = 500;
  let code = "INTERNAL_ERROR";
  let message = "Something went wrong";
  let details = null;

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === "ValidationError") {
    // Mongoose schema validation
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Request validation failed";
    details = Object.values(err.errors || {}).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === "CastError") {
    status = 400;
    code = "INVALID_ID";
    message = "Malformed identifier";
  } else if (err.code === 11000) {
    // Mongo duplicate key
    status = 409;
    code = "DUPLICATE";
    message = "That value is already in use";
    details = err.keyValue || null;
  }

  if (status >= 500) console.error("[error]", err);

  res.status(status).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
      ...(env.isProduction ? {} : { stack: err.stack }),
    },
    meta: null,
  });
};
