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

const logoCandidates = [
  path.join(__dirname, '../public/images/logo/logo.jpg'),
  path.join(__dirname, '../public/images/logo/logo.png'),
];
const faviconDir = path.join(__dirname, '../public/favicon');
const publicDir = path.join(__dirname, '../public');
const appIconPath = path.join(__dirname, '../app/icon.png');

// Ensure favicon directory exists
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
}

// Sizes to generate
const sizes = [
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
    // Pick the first available logo
    const logoPath = logoCandidates.find((p) => fs.existsSync(p));
    if (!logoPath) {
      console.error('Logo file not found. Checked:', logoCandidates.join(', '));
      console.log('Please ensure logo.jpg or logo.png exists at public/images/logo/');
      return;
    }

    console.log('Generating favicons from logo:', path.basename(logoPath));

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

    // Generate favicon.ico (32x32 for better quality)
    const icoPath = path.join(publicDir, 'favicon.ico');
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(icoPath);
    console.log('✓ Generated favicon.ico');

    // Generate Next.js app icon (used for metadata and PWA)
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(appIconPath);
    console.log('✓ Generated app/icon.png (512x512)');

    console.log('\n✅ All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\nPlease install sharp: npm install sharp --save-dev');
    }
  }
}

generateFavicons();





