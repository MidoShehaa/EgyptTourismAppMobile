const fs = require('fs');
const path = require('path');

const mappings = {
    'Siwa Oasis': 'siwa_oasis.png',
    'Shali Fortress': 'shali_fortress.png',
    'Mountain of the Dead': 'mountain_dead.png',
    'Great Sand Sea': 'great_sand_sea.png',
    "Cleopatra's Bath": 'cleopatra_bath.jpg',
    'Wadi El Rayan Waterfalls': 'wadi_el_rayan_waterfalls.png',
    'Lake Timsah': 'lake_timsah_ismailia.png',
    'Qaitbay Citadel': 'qaitbay_citadel_ai.jpg',
    'Saladin Citadel': 'saladin_citadel_ai.jpg',
    'Cairo Citadel': 'saladin_citadel_ai.jpg',
    'Bibliotheca Alexandrina': 'bibliotheca_alex_ai.jpg',
    'Alexandria Corniche': 'alex_corniche_ai.jpg',
    'Aswan High Dam': 'aswan_high_dam_ai.png',
    'Unfinished Obelisk': 'unfinished_obelisk_ai.png',
    'Kom Ombo Temple': 'kom_ombo_temple_ai.png',
    'Nubian Village': 'nubian_village_ai.png',
    'Elephantine Island': 'nubian_village_ai.png',
    'Valley of the Queens': 'valley_of_queens_ai.png',
    'Ramesseum Temple': 'ramesseum_ai.png',
    'Colossi of Memnon': 'colossi_of_memnon_ai.png',
    'Felucca Ride on the Nile': 'felucca_luxor_ai.png',
    'Montaza Palace and Gardens': 'montazah_palace_ai.png',
    'Montazah Palace Gardens': 'montazah_palace_ai.png',
    'Roman Amphitheatre': 'roman_amphitheatre_ai.png',
    'Naama Bay': 'naama_bay_ai.png',
    'De Lesseps Promenade': 'port_said_corniche.png',
    'Suez Canal': 'suez_canal_ai.png'
};

const dataFiles = [
    'src/constants/placesData.js',
    'src/constants/expandedData.js',
    'src/constants/nightlifeData.js'
];

dataFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const [name, img] of Object.entries(mappings)) {
        const regex = new RegExp("nameEn:\\s*['\"]" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"]", 'g');
        if (content.match(regex)) {
             const entryRegex = new RegExp("(nameEn:\\s*['\"]" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"],[\\s\\S]*?)(imageUrl:)", 'g');
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
