import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputSvg = path.join(__dirname, "..", "public", "icon.svg");
const publicDir = path.join(__dirname, "..", "public");
const appDir = path.join(__dirname, "..", "src", "app");

const icons = [
  { name: "apple-icon.png", size: 180 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "apple-touch-icon-180x180.png", size: 180 },
  { name: "apple-touch-icon-precomposed.png", size: 180 },
  { name: "icon-192x192.png", size: 192 },
  { name: "icon-512x512.png", size: 512 },
  { name: "favicon.ico", size: 32 },
];

async function generateIcons() {
  console.log("Generating PWA icons from public/icon.svg...");

  if (!fs.existsSync(inputSvg)) {
    console.error("Error: public/icon.svg not found.");
    process.exit(1);
  }

  for (const icon of icons) {
    const sourceSvg = icon.name === "apple-icon.png"
      ? path.join(publicDir, "apple-touch-icon.svg")
      : inputSvg;
    const outDir = icon.name === "apple-icon.png" || icon.name === "favicon.ico" ? appDir : publicDir;
    const outputPath = path.join(outDir, icon.name);

    try {
      await sharp(sourceSvg)
        .resize(icon.size, icon.size)
        .flatten({ background: { r: 244, g: 244, b: 234 } })
        .removeAlpha()
        .png({ colorType: 2 })
        .toFile(outputPath);

      console.log(`Generated ${icon.name} (${icon.size}x${icon.size}) at ${outDir}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to generate ${icon.name}: ${message}`);
      process.exitCode = 1;
    }
  }

  console.log("Icon generation complete.");
}

await generateIcons();
