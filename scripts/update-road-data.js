#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const stripBom = (text) => text.replace(/^\uFEFF/, '');

const SOURCES = [
  {
    name: 'Taipei',
    url: 'https://tpnco.blob.core.windows.net/blobfs/Todaywork.json',
    outputPath: path.resolve(__dirname, '..', 'public', 'taipei.json')
  },
  {
    name: 'Kaohsiung',
    url: 'https://data.kcg.gov.tw/Json/Get/d636aa85-4b08-42ab-a742-4f2aad070450',
    outputPath: path.resolve(__dirname, '..', 'public', 'kaohsiung.json')
  }
];

async function syncCity(source) {
  console.log(`📡 Fetching ${source.name} data from ${source.url}`);
  try {
    const response = await fetch(source.url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) tw-road-fix-map-updater'
      }
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch ${source.name} data: ${response.status} ${response.statusText}`);
      return;
    }

    const rawText = stripBom(await response.text());
    const parsed = JSON.parse(rawText);
    const nextContent = `${JSON.stringify(parsed, null, 2)}\n`;

    const currentContent = fs.existsSync(source.outputPath)
      ? stripBom(fs.readFileSync(source.outputPath, 'utf8'))
      : null;

    if (currentContent === nextContent) {
      console.log(`✅ ${source.name} JSON is already up to date.`);
      return;
    }

    fs.writeFileSync(source.outputPath, nextContent, 'utf8');
    console.log(`🎉 Updated ${source.name} -> ${source.outputPath}`);
  } catch (err) {
    console.error(`❌ Error syncing ${source.name}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Starting Taiwan Road Fix Map Data Sync...');
  for (const source of SOURCES) {
    await syncCity(source);
  }
  console.log('✨ All sync tasks finished.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
