import type { Device } from './types.js';

/**
 * Phone device definitions for responsive testing.
 * Includes Apple iPhones, Samsung Galaxy, Google Pixel, and Chinese brands.
 *
 * Device name format: "Device Name (WxH)" where W=width, H=height in CSS pixels.
 */
export const phones: readonly Device[] = [
  // Apple iPhones (8 devices)
  {
    name: 'iPhone 16 Pro Max (440x956)',
    width: 440,
    height: 956,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'iPhone 16 Pro (402x874)',
    width: 402,
    height: 874,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'iPhone 16 (393x852)',
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'iPhone 15 Pro Max (430x932)',
    width: 430,
    height: 932,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'iPhone 15 Pro (393x852)',
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'iPhone 15 (390x844)',
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'iPhone 14 Pro (393x852)',
    width: 393,
    height: 852,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'iPhone SE 3rd Gen (375x667)',
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    category: 'phones',
  },

  // Samsung Galaxy (7 devices)
  {
    name: 'Galaxy S24 Ultra (384x824)',
    width: 384,
    height: 824,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Galaxy S24+ (384x854)',
    width: 384,
    height: 854,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Galaxy S24 (360x780)',
    width: 360,
    height: 780,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Galaxy S23 Ultra (412x915)',
    width: 412,
    height: 915,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Galaxy S23 (360x780)',
    width: 360,
    height: 780,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Galaxy Z Fold 5 (384x832)',
    width: 384,
    height: 832,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Galaxy Z Flip 5 (412x915)',
    width: 412,
    height: 915,
    deviceScaleFactor: 2.6,
    category: 'phones',
  },

  // Google Pixel (5 devices)
  {
    name: 'Pixel 8 Pro (448x998)',
    width: 448,
    height: 998,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Pixel 8 (412x915)',
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
    category: 'phones',
  },
  {
    name: 'Pixel 7 Pro (412x892)',
    width: 412,
    height: 892,
    deviceScaleFactor: 3.5,
    category: 'phones',
  },
  {
    name: 'Pixel 7 (412x915)',
    width: 412,
    height: 915,
    deviceScaleFactor: 2.6,
    category: 'phones',
  },
  {
    name: 'Pixel 7a (412x915)',
    width: 412,
    height: 915,
    deviceScaleFactor: 2.6,
    category: 'phones',
  },

  // Chinese Brands (4 devices)
  {
    name: 'OnePlus 12 (412x915)',
    width: 412,
    height: 915,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Xiaomi 14 Pro (412x915)',
    width: 412,
    height: 915,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Huawei Mate 60 Pro (400x880)',
    width: 400,
    height: 880,
    deviceScaleFactor: 3,
    category: 'phones',
  },
  {
    name: 'Oppo Find X7 (412x915)',
    width: 412,
    height: 915,
    deviceScaleFactor: 3,
    category: 'phones',
  },
] as const;
