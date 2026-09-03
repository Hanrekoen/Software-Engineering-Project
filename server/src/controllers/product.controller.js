"use strict";
const productService = require("../services/product.service");
const { ok, created, noContent, paginated } = require("../utils/response");

// HTTP only: read the request, call one service method, shape the response.

async function list(req, res) {
  const { q, categoryId, brand, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
  const result = await productService.list({
    q,
    categoryId,
    brand,
    minCents: minPrice != null ? Number(minPrice) * 100 : undefined,
    maxCents: maxPrice != null ? Number(maxPrice) * 100 : undefined,
    sort,
    page: Number(page),
    limit: Number(limit),
  });
  return paginated(res, result.items, result);
}

async function getBySlug(req, res) {
  return ok(res, await productService.getBySlug(req.params.slug));
}

async function listBrands(req, res) {
  return ok(res, await productService.listBrands());
}

async function create(req, res) {
  return created(res, await productService.create(req.body));
}

async function update(req, res) {
  return ok(res, await productService.update(req.params.id, req.body));
}

async function deactivate(req, res) {
  await productService.deactivate(req.params.id);
  return noContent(res);
}

module.exports = { list, getBySlug, listBrands, create, update, deactivate };
