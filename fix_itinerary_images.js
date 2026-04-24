const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'constants', 'itinerarySuggestions.js');
let content = fs.readFileSync(filePath, 'utf8');

const images = [
    'https://images.unsplash.com/photo-1548232821-802bcc93666d',
    'https://images.unsplash.com/photo-1544124499-183636bc9d9d',
    'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368',
    'https://images.unsplash.com/photo-1544551763-47a0159f92ad',
    'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
    'https://images.unsplash.com/photo-1568322422394-3cb4978a353a'
];

let i = 0;
content = content.replace(/https:\/\/via\.placeholder\.com\/800x400\?text=No\+Image\+Available/g, () => {
    const img = images[i % images.length] + '?auto=format&fit=crop&w=800&q=80';
    i++;
    return img;
});

fs.writeFileSync(filePath, content);
console.log(`✅ Replaced ${i} placeholders with real Unsplash images.`);
