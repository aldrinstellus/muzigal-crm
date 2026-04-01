#!/usr/bin/env node
/* ───── Generate seed.json from the Excel migration file ─────
 *
 * Usage:  npx tsx src/data/generateSeed.ts
 *    or:  npm run seed
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseExcelToDataset } from './excelParser';

const __dirname = dirname(fileURLToPath(import.meta.url));

const EXCEL_PATH = resolve(
  __dirname,
  '../../reference docs from client/MS Data Migration (2).xlsx',
);
const OUTPUT_PATH = resolve(__dirname, 'seed.json');

console.log('Reading Excel file...');
const buffer = readFileSync(EXCEL_PATH);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

console.log('Parsing...');
const dataset = parseExcelToDataset(arrayBuffer as ArrayBuffer, 'MS Data Migration (2).xlsx');

console.log('Writing seed.json...');
writeFileSync(OUTPUT_PATH, JSON.stringify(dataset, null, 2));

console.log(`\nDone! Seed generated at ${OUTPUT_PATH}`);
console.log(`  Students:  ${dataset.meta.counts.students}`);
console.log(`  Enquiries: ${dataset.meta.counts.enquiries}`);
console.log(`  Batches:   ${dataset.meta.counts.batches}`);
console.log(`  Classes:   ${dataset.meta.counts.classes}`);
