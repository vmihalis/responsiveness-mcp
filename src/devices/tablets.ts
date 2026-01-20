import type { Device } from './types.js';

export const tablets: readonly Device[] = [
  // Apple iPads
  {
    name: 'iPad Pro 12.9 inch 2024 (1024x1366)',
    width: 1024,
    height: 1366,
    deviceScaleFactor: 2,
    category: 'tablets',
  },
  {
    name: 'iPad Pro 11 inch 2024 (834x1194)',
    width: 834,
    height: 1194,
    deviceScaleFactor: 2,
    category: 'tablets',
  },
  {
    name: 'iPad Air 2024 (820x1180)',
    width: 820,
    height: 1180,
    deviceScaleFactor: 2,
    category: 'tablets',
  },
  {
    name: 'iPad Pro 12.9 inch 2022 (1024x1366)',
    width: 1024,
    height: 1366,
    deviceScaleFactor: 2,
    category: 'tablets',
  },
  {
    name: 'iPad Pro 11 inch 2022 (834x1194)',
    width: 834,
    height: 1194,
    deviceScaleFactor: 2,
    category: 'tablets',
  },
  {
    name: 'iPad 10th Gen (820x1180)',
    width: 820,
    height: 1180,
    deviceScaleFactor: 2,
    category: 'tablets',
  },
  {
    name: 'iPad Mini 7th Gen (744x1133)',
    width: 744,
    height: 1133,
    deviceScaleFactor: 2,
    category: 'tablets',
  },
  {
    name: 'iPad Mini 2021 (768x1024)',
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    category: 'tablets',
  },

  // Samsung Galaxy Tabs
  {
    name: 'Galaxy Tab S9 Ultra (820x1138)',
    width: 820,
    height: 1138,
    deviceScaleFactor: 2.25,
    category: 'tablets',
  },
  {
    name: 'Galaxy Tab S9+ (820x1138)',
    width: 820,
    height: 1138,
    deviceScaleFactor: 2.14,
    category: 'tablets',
  },
  {
    name: 'Galaxy Tab S9 (753x1205)',
    width: 753,
    height: 1205,
    deviceScaleFactor: 2.125,
    category: 'tablets',
  },
  {
    name: 'Galaxy Tab S8 Ultra (820x1138)',
    width: 820,
    height: 1138,
    deviceScaleFactor: 2.25,
    category: 'tablets',
  },
  {
    name: 'Galaxy Tab S8 (753x1205)',
    width: 753,
    height: 1205,
    deviceScaleFactor: 2.125,
    category: 'tablets',
  },
] as const;
