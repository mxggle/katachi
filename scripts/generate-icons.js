const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputSvg = path.join(__dirname, '..', 'public', 'icon.svg');
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

const icons = [
  { name: 'apple-icon.png', size: 180 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-precomposed.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'favicon.ico', size: 32 },
];

async function generateIcons() {
  console.log('Generating PWA icons from public/icon.svg...');
  
  if (!fs.existsSync(inputSvg)) {
    console.error('Error: public/icon.svg not found!');
    process.exit(1);
  }

  for (const icon of icons) {
    const sourceSvg = icon.name === 'apple-icon.png' 
      ? path.join(publicDir, 'apple-touch-icon.svg') 
      : inputSvg;
      
    // Determine the correct output directory (app/ for Next metadata icons, public/ for manifest and iOS conventional icons)
    const outDir = (icon.name === 'apple-icon.png' || icon.name === 'favicon.ico') ? appDir : publicDir;
    const outputPath = path.join(outDir, icon.name);

    try {
      await sharp(sourceSvg)
        .resize(icon.size, icon.size)
        // Ensure absolutely no transparency for iOS compliance
        .flatten({ background: { r: 244, g: 244, b: 234 } })
        .removeAlpha() 
        .png({ colorType: 2 }) // colorType 2 is Truecolor without alpha
        .toFile(outputPath);
      
      console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size}) at ${outDir}`);
    } catch (err) {
      console.error(`✗ Failed to generate ${icon.name}:`, err.message);
    }
  }
  
  console.log('Icon generation complete!');
}

generateIcons();
