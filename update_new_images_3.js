const fs = require('fs');
const path = require('path');

const mappings = {
    'Blue Hole': 'blue_hole.jpg',
    'Abu Galoum': 'abu_galoum.jpg',
    'Three Pools': 'three_pools_dahab.jpg',
    'Gabal El Towaylat': 'gabal_el_towaylat.jpg',
    'Ras Shitan': 'ras_shitan.jpg',
    'Abu Simbel': 'abu_simbel.jpg',
    'Philae Temple': 'philae_temple.jpg',
    'Valley of the Kings': 'valley_of_the_kings.jpg',
    'Temple of Hatshepsut': 'hatshepsut_temple.jpg'
};

const dataFiles = [
    'src/constants/placesData.js',
    'src/constants/expandedData.js'
];

dataFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const [name, img] of Object.entries(mappings)) {
        // Use a more flexible regex to match the name even if it has extra words like 'Dahab'
        // But only if it's the start of the string
        const regex = new RegExp("nameEn:\\s*['\"]" + name + ".*?['\"]", 'g');
        if (content.match(regex)) {
             const entryRegex = new RegExp("(nameEn:\\s*['\"]" + name + ".*?['\"],[\\s\\S]*?)(imageUrl:|image:)", 'g');
             content = content.replace(entryRegex, (match, p1, p2) => {
                 if (p1.includes('localImage:')) {
                     return match;
                 }
                 console.log(`Updating ${name} in ${filePath}...`);
                 return `${p1}localImage: require('../../assets/real_images/${img}'),\n        ${p2}`;
             });
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Saved changes to ${filePath}`);
    }
});
