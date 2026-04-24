/**
 * COMPREHENSIVE DATA FIX SCRIPT
 * Fixes:
 * 1. Hotels with placeholder images → real Unsplash hotel images
 * 2. Places 11-14 missing &default= fallback
 * 3. Itinerary suggestions with generic/wrong images → specific destination images
 */

const fs = require('fs');
const path = require('path');

// ── FIX 1: HOTELS DATA ─────────────────────────────────────────────────────
const hotelImages = {
    // Mid-range
    50:  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80', // Kempinski Nile
    51:  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80', // Mercure Hurghada
    // Hostels/Budget
    101: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', // Life Pyramids Inn
    102: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80', // Marvel Stone
    201: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80', // Heritage Hostel Cairo
    202: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', // Cairo Hub
    301: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // Rafiki Dahab (pool/sea)
    302: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', // Basata Eco (nature)
    303: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', // Beit Tolba
    401: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80', // Ithaka Alexandria
    501: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80', // Pajama Aswan Nile
    502: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', // Kato Dool Nubian
    601: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?auto=format&fit=crop&w=800&q=80', // Sofia Luxor
    602: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', // Bob Marley Luxor
};

let hotelsContent = fs.readFileSync(path.join(__dirname, 'src/constants/hotelsData.js'), 'utf8');
for (const [id, url] of Object.entries(hotelImages)) {
    // Match the hotel block by id, then replace its placeholder image
    const pattern = new RegExp(
        `(id: ${id},[\\s\\S]*?image: )'https://via\\.placeholder\\.com/[^']*'`,
        'g'
    );
    hotelsContent = hotelsContent.replace(pattern, `$1'${url}'`);
}
fs.writeFileSync(path.join(__dirname, 'src/constants/hotelsData.js'), hotelsContent);
console.log('✅ Hotels images fixed');

// ── FIX 2: PLACES DATA (add &default= fallback for places 11-14) ────────────
let placesContent = fs.readFileSync(path.join(__dirname, 'src/constants/placesData.js'), 'utf8');

// Destination-specific better images
const placeImageFix = {
    11: 'https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F4%2F4a%2FSaint_Catherine_Monastery_Sinai_Egypt.jpg%2F800px-Saint_Catherine_Monastery_Sinai_Egypt.jpg&default=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1565117157272-e8d1e9d4e3f7%3Fauto%3Dformat%26fit%3Dcrop%26w%3D800%26q%3D80',
    12: 'https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F2%2F2b%2FMount_Sinai_Summit.jpg%2F800px-Mount_Sinai_Summit.jpg&default=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1506905925346-21bda4d32df4%3Fauto%3Dformat%26fit%3Dcrop%26w%3D800%26q%3D80',
    13: 'https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F2%2F20%2FJerusalem_Old_City_View.jpg%2F800px-Jerusalem_Old_City_View.jpg&default=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1548232821-802bcc93666d%3Fauto%3Dformat%26fit%3Dcrop%26w%3D800%26q%3D80',
    14: 'https://images.weserv.nl/?url=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F2%2F2f%2FPetra_Jordan_The_Treasury.jpg%2F800px-Petra_Jordan_The_Treasury.jpg&default=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1565117157272-e8d1e9d4e3f7%3Fauto%3Dformat%26fit%3Dcrop%26w%3D800%26q%3D80',
};

for (const [id, url] of Object.entries(placeImageFix)) {
    // Match the imageUrl field for this specific place id
    const pattern = new RegExp(
        `(id: ${id},[\\s\\S]*?imageUrl: )'[^']*'`,
        'g'
    );
    placesContent = placesContent.replace(pattern, `$1'${url}'`);
}
fs.writeFileSync(path.join(__dirname, 'src/constants/placesData.js'), placesContent);
console.log('✅ Places 11-14 imageUrls fixed with fallbacks');

// ── FIX 3: ITINERARY SUGGESTIONS — better destination-matched images ──────
const itineraryImages = {
    'master-1': 'https://images.unsplash.com/photo-1548232821-802bcc93666d?auto=format&fit=crop&w=800&q=80', // Jerusalem old city dome
    'master-2': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', // Mountain hiking sinai
    'top-1':    'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80', // Egypt pyramids
    'top-2':    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // Coral reef diving
};

let itinContent = fs.readFileSync(path.join(__dirname, 'src/constants/itinerarySuggestions.js'), 'utf8');
for (const [id, url] of Object.entries(itineraryImages)) {
    const pattern = new RegExp(
        `("id": "${id}",[\\s\\S]*?"image": )"[^"]*"`,
        'g'
    );
    itinContent = itinContent.replace(pattern, `$1"${url}"`);
}
// Also replace any remaining generic Gizah-pyramids-for-non-Cairo plans with thematic images
const rotatingImages = [
    'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=800&q=80', // Karnak columns
    'https://images.unsplash.com/photo-1568322422394-3cb4978a353a?auto=format&fit=crop&w=800&q=80', // Luxor sunset  
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80', // Red Sea resort
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80', // Sinai mountain
    'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80', // Pyramids aerial
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', // Sea/diving
];
let rotateIdx = 0;
itinContent = itinContent.replace(
    /"image": "https:\/\/images\.weserv\.nl\/?[^"]*All_Gizah_Pyramids[^"]*"/g,
    () => {
        const img = `"image": "${rotatingImages[rotateIdx % rotatingImages.length]}"`;
        rotateIdx++;
        return img;
    }
);
fs.writeFileSync(path.join(__dirname, 'src/constants/itinerarySuggestions.js'), itinContent);
console.log(`✅ Itinerary images fixed (${rotateIdx} generic images replaced + master plans updated)`);

console.log('\n🎉 All data fixes complete!');
