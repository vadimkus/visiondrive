#!/usr/bin/env node

/**
 * Generate favicon.ico from PNG files
 * 
 * This creates a multi-resolution .ico file from the generated PNGs
 * 
 * Requirements: npm install png-to-ico
 * Usage: node scripts/generate-ico.js
 */

const fs = require('fs');
const path = require('path');
const { default: pngToIco } = require('png-to-ico');

const FAVICON_DIR = path.join(__dirname, '../public/favicon');
const OUTPUT_ICO = path.join(__dirname, '../public/favicon.ico');

async function generateIco() {
  try {
    console.log('🎨 Generating favicon.ico...\n');

    const pngFiles = [
      path.join(FAVICON_DIR, 'favicon-16x16.png'),
      path.join(FAVICON_DIR, 'favicon-32x32.png'),
      path.join(FAVICON_DIR, 'favicon-48x48.png'),
    ];

    // Convert PNGs to ICO
    const icoBuffer = await pngToIco(pngFiles);
    fs.writeFileSync(OUTPUT_ICO, icoBuffer);

    console.log(`✅ Generated favicon.ico at ${OUTPUT_ICO}`);
    console.log('✨ Done!\n');

  } catch (error) {
    console.error('❌ Error generating ICO:', error);
    console.log('\n⚠️  png-to-ico may not be installed.');
    console.log('Run: npm install --save-dev png-to-ico\n');
    process.exit(1);
  }
}

generateIco();

