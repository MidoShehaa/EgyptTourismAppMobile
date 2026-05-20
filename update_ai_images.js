const fs = require('fs');

let places = fs.readFileSync('src/constants/placesData.js', 'utf8');

const placeMapping = {
    'Giza Pyramids': 'pyramids_giza_ai.png',
    'Khan el-Khalili': 'khan_el_khalili_ai.png',
    'Cairo Citadel': 'saladin_citadel_ai.png',
    'Bibliotheca Alexandrina': 'bibliotheca_alex_ai.png',
    'Qaitbay Citadel': 'qaitbay_citadel_ai.png',
    'Alexandria Corniche': 'alex_corniche_ai.png'
};

for (const [name, img] of Object.entries(placeMapping)) {
    // We are replacing whatever localImage was there before (like .jpg) with the new .png
    // Or if it didn't have localImage, we add it. 
    // It's safer to just replace any existing localImage line for this nameEn.
    const regex = new RegExp(`(nameEn:\\s*['"]${name}['"],[\\s\\S]*?localImage:\\s*require\\([^)]+\\),)`);
    if (places.match(regex)) {
        places = places.replace(regex, `$1`.replace(/localImage:\s*require\([^)]+\),/, `localImage: require('../../assets/real_images/${img}'),`));
    } else {
        // Fallback: if localImage doesn't exist yet, insert it before imageUrl
        const regex2 = new RegExp(`(nameEn:\\s*['"]${name}['"],[\\s\\S]*?)(imageUrl:)`, 'g');
        places = places.replace(regex2, `$1localImage: require('../../assets/real_images/${img}'),\n        $2`);
    }
}

fs.writeFileSync('src/constants/placesData.js', places, 'utf8');
console.log('Successfully updated placesData.js with AI images!');
