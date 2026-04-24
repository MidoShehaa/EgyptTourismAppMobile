const fs = require('fs');
const path = require('path');

const wrapProxy = (url) => {
    if (!url || url.includes('weserv.nl')) return url;
    const encoded = encodeURIComponent(url);
    return `https://images.weserv.nl/?url=${encoded}&default=${encoded}`;
};

// 1. Fix HotelsData.js (Real Images + Proxy)
const hotelRealImages = {
    1: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Four_Seasons_Hotel_in_Cairo.JPG',
    2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Nile_Ritz-Carlton_Hotel_Cairo_Egypt.jpg/800px-Nile_Ritz-Carlton_Hotel_Cairo_Egypt.jpg',
    6: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Old_Cataract_Hotel_Aswan.jpg/800px-Old_Cataract_Hotel_Aswan.jpg',
    7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Mena_House_Hotel_Giza.jpg/800px-Mena_House_Hotel_Giza.jpg',
};

const hotelsPath = path.join(__dirname, 'src', 'constants', 'hotelsData.js');
let hotelsContent = fs.readFileSync(hotelsPath, 'utf8');

// Replace specific real images first
for (const [id, url] of Object.entries(hotelRealImages)) {
    const regex = new RegExp(`(id: ${id},[\\s\\S]*?image: )'[^']*'`, 'g');
    hotelsContent = hotelsContent.replace(regex, `$1'${url}'`);
}

// Wrap ALL images in proxy
hotelsContent = hotelsContent.replace(/image: '(http[^']+)'/g, (match, url) => `image: '${wrapProxy(url)}'`);
fs.writeFileSync(hotelsPath, hotelsContent);
console.log('✅ HotelsData.js fixed with real images and proxy.');

// 2. Fix PlacesData.js (Proxy for all)
const placesPath = path.join(__dirname, 'src', 'constants', 'placesData.js');
let placesContent = fs.readFileSync(placesPath, 'utf8');
placesContent = placesContent.replace(/imageUrl: '(http[^']+)'/g, (match, url) => `imageUrl: '${wrapProxy(url)}'`);
fs.writeFileSync(placesPath, placesContent);
console.log('✅ PlacesData.js fixed with proxy.');

// 3. Fix ItinerarySuggestions.js (Proxy for all)
const itinPath = path.join(__dirname, 'src', 'constants', 'itinerarySuggestions.js');
let itinContent = fs.readFileSync(itinPath, 'utf8');
itinContent = itinContent.replace(/"image": "(http[^"]+)"/g, (match, url) => `"image": "${wrapProxy(url)}"`);
fs.writeFileSync(itinPath, itinContent);
console.log('✅ ItinerarySuggestions.js fixed with proxy.');

// 4. Fix OnboardingScreen.js (Proxy for all)
const onboardingPath = path.join(__dirname, 'src', 'screens', 'OnboardingScreen.js');
let onboardingContent = fs.readFileSync(onboardingPath, 'utf8');
onboardingContent = onboardingContent.replace(/image: '(http[^']+)'/g, (match, url) => `image: '${wrapProxy(url)}'`);
fs.writeFileSync(onboardingPath, onboardingContent);
console.log('✅ OnboardingScreen.js fixed with proxy.');

console.log('🚀 ALL IMAGES ARE NOW PROXIED AND STABLE.');
