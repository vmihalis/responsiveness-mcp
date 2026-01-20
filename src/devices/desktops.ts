import type { Device } from './types.js';

/**
 * Desktop and laptop viewport definitions.
 * All devices use category 'pc-laptops' as per project decision.
 */
export const desktops: readonly Device[] = [
  // Common Desktop Breakpoints (8 devices)
  {
    name: 'HD Desktop (1280x720)',
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'HD Laptop (1366x768)',
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'WXGA+ Laptop (1440x900)',
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'HD+ Laptop (1536x864)',
    width: 1536,
    height: 864,
    deviceScaleFactor: 1.25,
    category: 'pc-laptops',
  },
  {
    name: 'WSXGA+ Desktop (1680x1050)',
    width: 1680,
    height: 1050,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'Full HD Desktop (1920x1080)',
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'QHD Desktop (2560x1440)',
    width: 2560,
    height: 1440,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: '4K Desktop (3840x2160)',
    width: 3840,
    height: 2160,
    deviceScaleFactor: 2,
    category: 'pc-laptops',
  },

  // MacBook Displays (4 devices)
  {
    name: 'MacBook Air 13 inch (1440x900)',
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    category: 'pc-laptops',
  },
  {
    name: 'MacBook Pro 13 inch (1440x900)',
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    category: 'pc-laptops',
  },
  {
    name: 'MacBook Pro 14 inch (1512x982)',
    width: 1512,
    height: 982,
    deviceScaleFactor: 2,
    category: 'pc-laptops',
  },
  {
    name: 'MacBook Pro 16 inch (1728x1117)',
    width: 1728,
    height: 1117,
    deviceScaleFactor: 2,
    category: 'pc-laptops',
  },

  // Ultrawide Monitors (3 devices)
  {
    name: 'Ultrawide QHD (3440x1440)',
    width: 3440,
    height: 1440,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'Super Ultrawide (5120x1440)',
    width: 5120,
    height: 1440,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'Ultrawide WQHD+ (3840x1600)',
    width: 3840,
    height: 1600,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },

  // Standard Monitor Sizes (5 devices)
  {
    name: 'Small Monitor (1024x768)',
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'Standard Monitor (1280x1024)',
    width: 1280,
    height: 1024,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: 'Wide Monitor (1920x1200)',
    width: 1920,
    height: 1200,
    deviceScaleFactor: 1,
    category: 'pc-laptops',
  },
  {
    name: '5K Display (2560x1440)',
    width: 2560,
    height: 1440,
    deviceScaleFactor: 2,
    category: 'pc-laptops',
  },
  {
    name: 'iMac 27 inch (2560x1440)',
    width: 2560,
    height: 1440,
    deviceScaleFactor: 2,
    category: 'pc-laptops',
  },
] as const;
