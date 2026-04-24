const fs = require('fs');
const path = require('path');

const directImageMap = {
    1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/800px-All_Gizah_Pyramids.jpg',
    2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/The_Grand_Egyptian_Museum.jpg/800px-The_Grand_Egyptian_Museum.jpg',
    3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Khan_el-Khalili.jpg/800px-Khan_el-Khalili.jpg',
    4: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Karnak_Temple_Complex.jpg/800px-Karnak_Temple_Complex.jpg',
    5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Ras_Mohammed_National_Park.jpg/800px-Ras_Mohammed_National_Park.jpg',
    6: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Abu_Simbel_Temple_of_Ramesses_II.jpg/800px-Abu_Simbel_Temple_of_Ramesses_II.jpg',
    7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Valley_of_the_Kings_-_2019.jpg/800px-Valley_of_the_Kings_-_2019.jpg',
    8: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sultan_Hassan_Mosque_1.jpg/800px-Sultan_Hassan_Mosque_1.jpg',
    9: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Blue_Hole_Dahab.jpg/800px-Blue_Hole_Dahab.jpg',
    10: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/SS_Thistlegorm_Wreck.jpg/800px-SS_Thistlegorm_Wreck.jpg',
    11: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bahariya_Oasis.jpg/800px-Bahariya_Oasis.jpg',
    12: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Safaga_Beach.jpg/800px-Safaga_Beach.jpg',
    35: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Saint_Sama%27an%2C_Mokattam.jpg/800px-Saint_Sama%27an%2C_Mokattam.jpg',
    36: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Deir_Anba_Bishoy.jpg/800px-Deir_Anba_Bishoy.jpg',
    40: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Colored_Canyon_Sinai.jpg/800px-Colored_Canyon_Sinai.jpg',
};

const file = path.join(__dirname, 'src', 'constants', 'placesData.js');
let content = fs.readFileSync(file, 'utf8');
let count = 0;

for (const [id, url] of Object.entries(directImageMap)) {
    const r = new RegExp(`(id:\\s*${id},[\\s\\S]*?imageUrl:\\s*')[^']+(')`);
    content = content.replace(r, `$1${url}$2`);
    count++;
}

// For Any remaining Unsplash URLs that might be blocked in your network, replace them with Wikipedia or generic working URLs
content = content.replace(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+[^']+/g, 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Nile_River_and_Cairo_Tower.jpg/800px-Nile_River_and_Cairo_Tower.jpg');

fs.writeFileSync(file, content);
console.log(`✅ تم تحديث ${count} صور حقيقية بنجاح من ويكيبيديا، وتم استبدال باقي الصور بأخرى آمنة.`);
