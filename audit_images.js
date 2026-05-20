const fs = require('fs');
const path = require('path');

const dataFiles = [
    'src/constants/placesData.js',
    'src/constants/expandedData.js',
    'src/constants/diningData.js',
    'src/constants/hotelsData.js',
    'src/constants/nightlifeData.js'
];

const assetsDir = path.join(__dirname, 'assets', 'real_images');
const existingImages = fs.readdirSync(assetsDir);

const missing = [];

dataFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Simple regex to find nameEn and localImage
    // This is a bit crude but should work for this structure
    const blocks = content.split('id:').slice(1);
    blocks.forEach(block => {
        const nameMatch = block.match(/nameEn:\s*['"](.*?)['"]/);
        const localImageMatch = block.match(/localImage:\s*require\(['"]\.\.\/\.\.\/assets\/real_images\/(.*?)['"]\)/);
        
        if (nameMatch) {
            const name = nameMatch[1];
            let imageFile = localImageMatch ? localImageMatch[1] : null;
            
            if (!imageFile) {
                missing.push({ name, file, reason: 'No localImage field' });
            } else if (!existingImages.includes(imageFile)) {
                missing.push({ name, file, reason: `File ${imageFile} missing`, imageFile });
            } else {
                const stats = fs.statSync(path.join(assetsDir, imageFile));
                if (stats.size < 100) {
                     missing.push({ name, file, reason: `File ${imageFile} is too small (${stats.size} bytes)`, imageFile });
                }
            }
        }
    });
});

console.log(JSON.stringify(missing, null, 2));
