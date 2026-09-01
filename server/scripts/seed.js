"use strict";
/**
 * Seeds the database with categories and products so the catalogue has
 * something to render. Safe to re-run: it clears both collections first.
 *
 *   npm run seed
 *
 * Person 4 owns this file going forward - extend it with users and orders.
 */
const { connect, disconnect } = require("../src/config/database");
const Category = require("../src/models/category.model");
const Product = require("../src/models/product.model");

const CATEGORIES = [
  { name: "Audio Architecture", slug: "audio-architecture", icon: "audio",
    description: "Headphones, amplifiers and acoustic hardware." },
  { name: "Modular Keyboards", slug: "modular-keyboards", icon: "keyboard",
    description: "Mechanical and modular input devices." },
  { name: "Optical Sensors", slug: "optical-sensors", icon: "camera",
    description: "Webcams, capture devices and optics." },
  { name: "Neural Displays", slug: "neural-displays", icon: "display",
    description: "High refresh and ultra-wide displays." },
  { name: "Gaming Mice", slug: "gaming-mice", icon: "mouse",
    description: "Precision pointing devices." },
];

const IMG = "https://placehold.co/800x800/0b0f16/3b82f6?text=";

const PRODUCTS = [
  {
    name: "AeroPulse ANC Headset", slug: "aeropulse-anc-headset", sku: "AP-ANC-001",
    brand: "AeroPulse", categorySlug: "audio-architecture", priceCents: 34900, stockQty: 24,
    ratingAverage: 4.8, ratingCount: 1124,
    description: "Audiophile grade electrostatic drivers with hybrid neural noise cancellation.",
    variants: [ { name: "Obsidian Black", hex: "#111418" }, { name: "Arctic Silver", hex: "#C9CED6" }, { name: "Vault Blue", hex: "#2563EB" } ],
    specs: [
      { label: "Driver Tech", value: "46mm Electrostatic" },
      { label: "Freq Response", value: "4Hz - 46kHz" },
      { label: "ANC Level", value: "Hybrid Neural, -46dB" },
      { label: "Battery Life", value: "54 hrs (Active ANC)" },
      { label: "Connectivity", value: "Ultra-Low Latency Wireless + USB-C" },
    ],
  },
  {
    name: "Obsidian X-9 Headset", slug: "obsidian-x-9-headset", sku: "OB-X9-002",
    brand: "Obsidian", categorySlug: "audio-architecture", priceCents: 34900, stockQty: 15,
    ratingAverage: 4.9, ratingCount: 1124,
    description: "Reference class closed-back headset finished in carbon composite.",
    variants: [ { name: "Carbon Black", hex: "#0F1216" }, { name: "Gunmetal", hex: "#5A6270" } ],
    specs: [
      { label: "Driver Tech", value: "40mm Planar" },
      { label: "Freq Response", value: "5Hz - 40kHz" },
      { label: "Battery Life", value: "48 hrs" },
    ],
  },
  {
    name: "NovaKey MX60 Mechanical", slug: "novakey-mx60-mechanical", sku: "NK-MX60-003",
    brand: "NovaKey", categorySlug: "modular-keyboards", priceCents: 18900, stockQty: 2,
    ratingAverage: 4.6, ratingCount: 402,
    description: "Hot-swappable 60% mechanical keyboard with gasket mount and MX Teal switches.",
    variants: [ { name: "Death Wisp", hex: "#1B1F27" }, { name: "Frost", hex: "#E8EDF4" } ],
    specs: [
      { label: "Layout", value: "60% Hot-swap" },
      { label: "Switches", value: "MX Teal Tactile" },
      { label: "Connectivity", value: "USB-C, Bluetooth 5.3" },
    ],
  },
  {
    name: "Cortex Prime Pro Webcam", slug: "cortex-prime-pro-webcam", sku: "CP-CAM-004",
    brand: "Cortex Prime", categorySlug: "optical-sensors", priceCents: 29900, stockQty: 31,
    ratingAverage: 4.7, ratingCount: 288,
    description: "4K60 capture with on-sensor neural framing and ring illumination.",
    variants: [ { name: "Matte Black", hex: "#14181F" } ],
    specs: [
      { label: "Resolution", value: "4K @ 60fps" },
      { label: "Field of View", value: "78 degrees" },
      { label: "Focus", value: "Neural autofocus" },
    ],
  },
  {
    name: "Sonic Labs DAC Amplifier", slug: "sonic-labs-dac-amplifier", sku: "SL-DAC-005",
    brand: "Sonic Labs", categorySlug: "audio-architecture", priceCents: 49900, stockQty: 9,
    ratingAverage: 4.8, ratingCount: 173,
    description: "Balanced desktop DAC and headphone amplifier, 32-bit / 768kHz.",
    variants: [ { name: "Anodised Black", hex: "#0E1116" } ],
    specs: [
      { label: "DAC Chip", value: "ES9038PRO" },
      { label: "Sample Rate", value: "768kHz / 32-bit" },
      { label: "Output", value: "Balanced XLR + 6.35mm" },
    ],
  },
  {
    name: "Apex Pro Neural Display", slug: "apex-pro-neural-display", sku: "AX-DSP-006",
    brand: "Apex", categorySlug: "neural-displays", priceCents: 129900, stockQty: 6,
    ratingAverage: 4.9, ratingCount: 96,
    description: "34 inch ultrawide OLED at 240Hz with hardware colour calibration.",
    variants: [ { name: "Shadow", hex: "#0B0E13" } ],
    specs: [
      { label: "Panel", value: "34in OLED Ultrawide" },
      { label: "Refresh", value: "240Hz" },
      { label: "Response", value: "0.03ms GtG" },
    ],
  },
  {
    name: "Obsidian X-9 Carbon Mouse", slug: "obsidian-x-9-carbon-mouse", sku: "OB-MSE-007",
    brand: "Obsidian", categorySlug: "gaming-mice", priceCents: 14900, stockQty: 42,
    ratingAverage: 4.5, ratingCount: 331,
    description: "38 gram carbon fibre shell with a 32K optical sensor.",
    variants: [ { name: "Carbon", hex: "#15181D" }, { name: "White Out", hex: "#F2F4F7" } ],
    specs: [
      { label: "Weight", value: "38g" },
      { label: "Sensor", value: "32,000 DPI Optical" },
      { label: "Polling", value: "8000Hz" },
    ],
  },
];

async function run() {
  await connect();

  await Category.deleteMany({});
  await Product.deleteMany({});
  console.log("[seed] cleared categories and products");

  const categories = await Category.insertMany(CATEGORIES);
  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));
  console.log(`[seed] inserted ${categories.length} categories`);

  const products = PRODUCTS.map((p) => {
    const { categorySlug, ...rest } = p;
    return {
      ...rest,
      categoryId: bySlug[categorySlug],
      images: [
        IMG + encodeURIComponent(p.name),
        IMG + encodeURIComponent(p.name + " 2"),
        IMG + encodeURIComponent(p.name + " 3"),
        IMG + encodeURIComponent(p.name + " 4"),
      ],
      isActive: true,
    };
  });

  const inserted = await Product.insertMany(products);
  console.log(`[seed] inserted ${inserted.length} products`);

  await disconnect();
  console.log("[seed] done");
}

run().catch(async (err) => {
  console.error("[seed] failed:", err);
  await disconnect();
  process.exit(1);
});
