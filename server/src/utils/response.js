"use strict";

// One response envelope for the whole API: { success, data, error, meta }.

function ok(res, data = null, meta = null, status = 200) {
  return res.status(status).json({ success: true, data, error: null, meta });
}

function created(res, data, meta = null) {
  return ok(res, data, meta, 201);
}

function noContent(res) {
  return res.status(204).send();
}

function paginated(res, items, { page, limit, total }) {
  return ok(res, items, {
    page, limit, total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}

module.exports = { ok, created, noContent, paginated };
