"use strict";
const express = require("express");

// Single mount point. Export a router from your routes file and add it here.

const router = express.Router();

router.get("/health", (_req, res) =>
  res.json({
    success: true,
    data: { status: "ok", time: new Date().toISOString() },
    error: null,
    meta: null,
  })
);

router.use("/auth", require("./auth.routes"));                // Person 2
router.use("/products", require("./product.routes"));         // Person 1
router.use("/categories", require("./category.routes"));      // Person 4
router.use("/cart", require("./cart.routes"));                 // Person 3
router.use("/orders", require("./order.routes"));             // Person 1
router.use("/admin", require("./admin.routes"));              // Person 1

module.exports = router;
