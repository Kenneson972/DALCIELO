#!/usr/bin/env node
/**
 * Génère les favicons (icon.png, apple-icon.png) à partir du logo.
 * Usage: node scripts/generate-favicon.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logoPath = join(root, 'public', 'images', 'logo.png');
const appDir = join(root, 'src', 'app');

const logo = readFileSync(logoPath);

await sharp(logo)
  .resize(32, 32)
  .png()
  .toFile(join(appDir, 'icon.png'));

await sharp(logo)
  .resize(180, 180)
  .png()
  .toFile(join(appDir, 'apple-icon.png'));

console.log('Favicons générés: src/app/icon.png (32x32), src/app/apple-icon.png (180x180)');
