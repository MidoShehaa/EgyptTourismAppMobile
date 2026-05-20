const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Mido\\.gemini\\antigravity\\brain\\9ebf1469-8c4d-4209-8b6a-c5486029e8c7';
const destDir = 'C:\\Users\\Mido\\Desktop\\EgyptTourismMobile\\assets\\real_images';

const files = {
  'siwa_oasis_1778731145695.png': 'siwa_oasis.png',
  'cleopatras_pool_1778731178422.png': 'cleopatras_pool.png',
  'shali_fortress_1778731191991.png': 'shali_fortress.png',
  'mountain_dead_1778731253214.png': 'mountain_dead.png',
  'great_sand_sea_1778731309787.png': 'great_sand_sea.png'
};

// 1. Copy files
for (const [src, dest] of Object.entries(files)) {
  fs.copyFileSync(path.join(srcDir, src), path.join(destDir, dest));
  console.log('Copied', dest);
}

// 2. Update placesData.js
const placesFile = 'C:\\Users\\Mido\\Desktop\\EgyptTourismMobile\\src\\constants\\placesData.js';
let content = fs.readFileSync(placesFile, 'utf8');

const replacements = {
  2001: 'siwa_oasis.png',
  2002: 'cleopatras_pool.png',
  2003: 'shali_fortress.png',
  2004: 'mountain_dead.png',
  2005: 'great_sand_sea.png'
};

for (const [id, image] of Object.entries(replacements)) {
  const regex = new RegExp(`(id: ${id},[\\s\\S]*?image: '[^']+',\\s*)(imageUrl: '[^']+',)`);
  content = content.replace(regex, `$1localImage: require('../../assets/real_images/${image}'),\n        $2`);
}

fs.writeFileSync(placesFile, content, 'utf8');
console.log('Updated placesData.js for Siwa');
