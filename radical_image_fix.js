const fs = require('fs');

function applyProxy(filePath, imageField) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Regex to find wikipedia urls
    const wikipediaRegex = /'https:\/\/upload\.wikimedia\.org\/[^']+'/g;
    content = content.replace(wikipediaRegex, (match) => {
        const url = match.slice(1, -1);
        return `'https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(url)}'`;
    });
    fs.writeFileSync(filePath, content, 'utf8');
}

applyProxy('src/constants/placesData.js');
applyProxy('src/constants/hotelsData.js');
applyProxy('src/screens/OnboardingScreen.js');

console.log('Radical Image Fix: All Wikipedia URLs are now proxied via images.weserv.nl');
