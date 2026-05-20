const fs = require('fs');

let places = fs.readFileSync('src/constants/placesData.js', 'utf8');

const placeMapping = {
    "nameEn: 'Valley of the Queens'": "valley_of_queens_ai.png",
    "nameEn: 'Ramesseum'": "ramesseum_ai.png",
    "nameEn: 'Colossi of Memnon'": "colossi_of_memnon_ai.png",
    "nameEn: 'Felucca Ride in Luxor'": "felucca_luxor_ai.png",
    "nameEn: 'Aswan High Dam'": "aswan_high_dam_ai.png",
    "nameEn: 'Elephantine & Nubian Village'": "nubian_village_ai.png"
};

for (const [nameMatch, imgName] of Object.entries(placeMapping)) {
    // We split the file by nameMatch to easily target the right object
    const parts = places.split(nameMatch);
    if (parts.length > 1) {
        // Find the first 'imageUrl:' after nameMatch in parts[1]
        const imageUrlIndex = parts[1].indexOf('imageUrl:');
        if (imageUrlIndex !== -1) {
            // Check if localImage is already there before imageUrl
            const beforeImageUrl = parts[1].substring(0, imageUrlIndex);
            if (!beforeImageUrl.includes('localImage:')) {
                parts[1] = parts[1].substring(0, imageUrlIndex) + `localImage: require('../../assets/real_images/${imgName}'),\n        ` + parts[1].substring(imageUrlIndex);
            } else {
                // If it exists, replace the require statement
                parts[1] = parts[1].replace(/localImage:\s*require\([^)]+\),/, `localImage: require('../../assets/real_images/${imgName}'),`);
            }
        }
        places = parts.join(nameMatch);
    }
}

fs.writeFileSync('src/constants/placesData.js', places, 'utf8');
console.log('Successfully updated placesData.js with newly generated images!');
