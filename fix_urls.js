const fs = require('fs');
const path = 'src/constants/placesData.js';
let content = fs.readFileSync(path, 'utf8');

// Replace all thumb URLs with direct URLs
content = content.replace(/https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/([0-9a-f/]+)\/[^/]+\/[0-9]+px-[^"']+/g, (match, p1) => {
    return `https://upload.wikimedia.org/wikipedia/commons/${p1}`;
});

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated all URLs in placesData.js');
