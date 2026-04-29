#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://tpnco.blob.core.windows.net/blobfs/Todaywork.json';
const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'taipei.json');

const stripBom = (text) => text.replace(/^\uFEFF/, '');

async function main() {
  console.log(`Fetching Taipei data from ${SOURCE_URL}`);

  const response = await fetch(SOURCE_URL, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'tw-road-fix-map-updater'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Taipei data: ${response.status} ${response.statusText}`);
  }

  const rawText = stripBom(await response.text());
  const parsed = JSON.parse(rawText);
  const nextContent = `${JSON.stringify(parsed, null, 2)}\n`;
  const currentContent = fs.existsSync(OUTPUT_PATH)
    ? stripBom(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    : null;

  if (currentContent === nextContent) {
    console.log('Taipei JSON is already up to date.');
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, nextContent, 'utf8');
  console.log(`Updated ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});