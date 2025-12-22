#!/usr/bin/env node

/**
 * Favicon Generator Script
 * 
 * This script generates all required favicon sizes from the main logo
 * with transparent background and larger logo size.
 * 
 * Requirements: npm install sharp
 * Usage: node scripts/generate-favicons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_LOGO = path.join(__dirname, '../public/images/logo/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public/favicon');

// Favicon sizes to generate
const SIZES = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 128, name: 'favicon-128x128.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

async function generateFavicons() {
  try {
    console.log('🎨 Starting favicon generation...\n');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Read the original logo
    const logoBuffer = await sharp(INPUT_LOGO)
      .toBuffer();

    console.log(`📂 Source: ${INPUT_LOGO}`);
    console.log(`📁 Output: ${OUTPUT_DIR}\n`);

    // Generate each size
    for (const { size, name } of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, name);
      
      // Calculate the logo size (85% of canvas)
      const logoSize = Math.round(size * 0.85);
      const padding = Math.round((size - logoSize) / 2);

      await sharp(INPUT_LOGO)
        // First, ensure we have transparency
        .flatten({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
        // Resize the logo to 85% of target size
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        // Extend to full size with transparent padding
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        // Ensure final size is exact
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${name} (${size}x${size})`);
    }

    console.log('\n✨ All favicons generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)');
    console.log('2. Reload the page to see the new favicon');
    console.log('3. Check if the logo is now bigger and has transparent background');

  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

// Run the script
generateFavicons();

