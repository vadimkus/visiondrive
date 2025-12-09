/**
 * Script to generate favicon files from logo
 * 
 * This script requires sharp to be installed:
 * npm install sharp --save-dev
 * 
 * Usage: node scripts/generate-favicon.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '../public/images/logo/logo.png');
const faviconDir = path.join(__dirname, '../public/favicon');
const publicDir = path.join(__dirname, '../public');

// Ensure favicon directory exists
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
}

// Sizes to generate
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
];

async function generateFavicons() {
  try {
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('Logo file not found at:', logoPath);
      console.log('Please ensure logo.png exists at public/images/logo/logo.png');
      return;
    }

    console.log('Generating favicons from logo...');

    // Generate PNG favicons
    for (const { size, name } of sizes) {
      const outputPath = path.join(faviconDir, name);
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (16x16)
    const icoPath = path.join(publicDir, 'favicon.ico');
    await sharp(logoPath)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(icoPath);
    console.log('✓ Generated favicon.ico');

    console.log('\n✅ All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\nPlease install sharp: npm install sharp --save-dev');
    }
  }
}

generateFavicons();

