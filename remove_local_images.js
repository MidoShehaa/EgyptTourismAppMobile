const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'src/constants/placesData.js',
    'src/constants/hotelsData.js',
    'src/constants/diningData.js',
    'src/constants/expandedData.js',
    'src/constants/ridesData.js',
    'src/constants/newCitiesData.js'
];

filesToProcess.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove localImage: require(...)
    content = content.replace(/\s*localImage:\s*require\([^)]+\),?/g, '');
    
    // Remove localImage: "..." (just in case)
    content = content.replace(/\s*localImage:\s*['"][^'"]+['"],?/g, '');

    // Remove require(...) from gallery arrays or imageUrl
    content = content.replace(/\s*imageUrl:\s*require\([^)]+\),?/g, '');
    content = content.replace(/\s*require\([^)]+\),?/g, '');

    fs.writeFileSync(fullPath, content);
    console.log(`Processed: ${file}`);
});
