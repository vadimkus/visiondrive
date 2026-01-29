/**
 * Generate favicons from SVG source
 * 
 * Prerequisites:
 * npm install sharp
 * 
 * Run:
 * node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_SOURCE = path.join(__dirname, '../app/icon.svg');
const PUBLIC_DIR = path.join(__dirname, '../public');
const FAVICON_DIR = path.join(PUBLIC_DIR, 'favicon');

// Sizes to generate
const SIZES = {
  // Standard favicons
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'favicon-48x48.png': 48,
  'favicon-64x64.png': 64,
  'favicon-96x96.png': 96,
  'favicon-128x128.png': 128,
  // Apple touch icons
  'apple-touch-icon.png': 180,
  // Android Chrome
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
};

async function generateFavicons() {
  console.log('🎨 Generating favicons from SVG...\n');
  
  // Read SVG
  const svgBuffer = fs.readFileSync(SVG_SOURCE);
  
  // Ensure favicon directory exists
  if (!fs.existsSync(FAVICON_DIR)) {
    fs.mkdirSync(FAVICON_DIR, { recursive: true });
  }
  
  // Generate each size
  for (const [filename, size] of Object.entries(SIZES)) {
    const outputPath = path.join(FAVICON_DIR, filename);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated ${filename} (${size}x${size})`);
  }
  
  // Also generate favicon.png in public root
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.png'));
  console.log('✅ Generated favicon.png (32x32)');
  
  // Generate ICO file (32x32 PNG as ICO for simplicity)
  // Note: For proper .ico with multiple sizes, use a dedicated tool
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico.png'));
  
  // Rename to .ico (browsers accept PNG data in .ico files)
  fs.renameSync(
    path.join(PUBLIC_DIR, 'favicon.ico.png'),
    path.join(PUBLIC_DIR, 'favicon.ico')
  );
  console.log('✅ Generated favicon.ico (32x32)');
  
  // Copy to app directory for Next.js
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../app/icon.png'));
  console.log('✅ Generated app/icon.png (512x512)');
  
  console.log('\n🎉 All favicons generated successfully!');
  console.log('\nNext steps:');
  console.log('1. Verify the icons look correct');
  console.log('2. Run: git add -A && git commit -m "Update favicons"');
}

generateFavicons().catch(console.error);
