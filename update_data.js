const fs = require('fs');

let places = fs.readFileSync('src/constants/placesData.js', 'utf8');

const placeMapping = {
    'Agiba Beach': 'agiba_beach.png',
    'Cleopatra Bath': 'cleopatra_bath.png',
    'Sidi Abdel Rahman': 'sidi_abdel_rahman.png',
    'El Lessan': 'el_lessan.png',
    'Nile Street': 'nile_street.png',
    'Valley of the Kings': 'valley_of_the_kings.png',
    'Luxor Temple': 'luxor_temple.png',
    'Hatshepsut Temple': 'hatshepsut_temple.png',
    'Abu Simbel': 'abu_simbel.png',
    'Philae Temple': 'philae_temple.png'
};

for (const [name, img] of Object.entries(placeMapping)) {
    const regex = new RegExp('(nameEn:\\s*[\'\"]' + name + '[\'\"],[\\s\\S]*?)(imageUrl:)', 'g');
    places = places.replace(regex, '$1localImage: require(\'../../assets/real_images/' + img + '\'),\n        $2');
}

fs.writeFileSync('src/constants/placesData.js', places, 'utf8');

let hotels = fs.readFileSync('src/constants/hotelsData.js', 'utf8');

const hotelMapping = {
    'Address Marassi Golf Resort': 'address_marassi.png', // The Address Marassi Golf Resort
    'Jaz Almaza Beach Resort': 'jaz_almaza.png',
    'Carols Beau Rivage': 'carols_beau_rivage.png',
    'Steigenberger Hotel El Lessan': 'steigenberger_lessan.png',
    'Dolphin Ras El Bar': 'dolphin_hotel.png'
};

for (const [name, img] of Object.entries(hotelMapping)) {
    const regex = new RegExp('(name:\\s*[\'\"]' + name.replace(/ /g, '\\s+') + '[\'\"],[\\s\\S]*?)(image:)', 'i');
    hotels = hotels.replace(regex, '$1localImage: require(\'../../assets/real_images/' + img + '\'),\n        $2');
}
// For The Address Marassi Golf Resort which has "The " at start
hotels = hotels.replace(/(name:\s*['"]The Address Marassi Golf Resort['"],[\s\S]*?)(image:)/i, '$1localImage: require(\'../../assets/real_images/address_marassi.png\'),\n        $2');

fs.writeFileSync('src/constants/hotelsData.js', hotels, 'utf8');

let dining = fs.readFileSync('src/constants/diningData.js', 'utf8');

const diningMapping = {
    'Magdy Seafood': 'magdy_seafood.png',
    'Sachi By The Sea': 'sachi_by_the_sea.png',
    'Badry Sweets': 'badry_sweets.png',
    'Kholoud Seafood': 'kholoud_seafood.png'
};

// Some of these restaurants might not be in diningData.js, let's check
// We will just do a blind replace and see if it hits
for (const [name, img] of Object.entries(diningMapping)) {
    const regex = new RegExp('(name:\\s*[\'\"]' + name.replace(/ /g, '\\s+') + '[\'\"],[\\s\\S]*?)(image:)', 'i');
    dining = dining.replace(regex, '$1localImage: require(\'../../assets/real_images/' + img + '\'),\n        $2');
}

fs.writeFileSync('src/constants/diningData.js', dining, 'utf8');

console.log('Update Complete');
