const fs = require('fs');
const path = require('path');

const mappings = {
    // Hotels
    'Rafiki Hostels - Dahab': 'rafiki_hostel.jpg',
    'Rafiki Hostels': 'rafiki_hostel.jpg',
    'Penguin Village': 'penguin_village.jpg',
    'Seven Heaven Camp': 'seven_heaven_camp.jpg',
    'Le Méridien Dahab Resort': 'le_meridien_dahab.jpg',
    'Basata Eco-Lodge': 'basata.jpg',
    'Dayra Camp': 'dayra.jpg',
    'Steigenberger Hotel El Lessan': 'steigenberger_lessan.jpg',
    'Dolphin Ras El Bar': 'dolphin_hotel.jpg',
    
    // Dining
    "Ralph's German Bakery": 'ralphs_german_bakery.jpg',
    'Magdy Seafood': 'magdy_seafood.jpg',
    'Sachi by the Sea': 'sachi_by_the_sea.jpg',
    'حلويات البدري': 'badry_sweets.jpg',
    'خلود النيل': 'kholoud_seafood.jpg'
};

const dataFiles = [
    'src/constants/hotelsData.js',
    'src/constants/diningData.js'
];

dataFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    for (const [name, img] of Object.entries(mappings)) {
        // Find name: "name" or name: 'name'
        const regex = new RegExp("name:\\s*['\"]" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"]", 'g');
        if (content.match(regex)) {
             // For hotels, the key is 'image:' or 'localImage:'
             // We want to insert localImage before image
             const entryRegex = new RegExp("(name:\\s*['\"]" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"],[\\s\\S]*?)(image:)", 'g');
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
