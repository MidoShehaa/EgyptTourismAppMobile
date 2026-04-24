const https = require('https');
const fs = require('fs');
const path = require('path');

const wikiPlaces = [
    { id: 1, title: "Giza_Necropolis" },
    { id: 2, title: "Egyptian_Museum" },
    { id: 3, title: "Khan_el-Khalili" },
    { id: 4, title: "Karnak" },
    { id: 5, title: "Red_Sea" },
    { id: 6, title: "Abu_Simbel_temples" },
    { id: 7, title: "Valley_of_the_Kings" },
    { id: 8, title: "Mosque-Madrasa_of_Sultan_Hasan" },
    { id: 9, title: "Blue_Hole_(Red_Sea)" },
    { id: 10, title: "SS_Thistlegorm" },
    { id: 11, title: "Bahariya_Oasis" },
    { id: 12, title: "Safaga" },
    { id: 13, title: "Mosque_of_Ibn_Tulun" },
    { id: 14, title: "Sharm_El_Sheikh" },
    { id: 15, title: "Cairo" },
    { id: 16, title: "Cairo_Citadel" },
    { id: 17, title: "Al-Azhar_Mosque" },
    { id: 18, title: "Hanging_Church" },
    { id: 19, title: "Philae" },
    { id: 20, title: "Mortuary_Temple_of_Hatshepsut" },
    { id: 21, title: "Citadel_of_Qaitbay" },
    { id: 22, title: "White_Desert_National_Park" },
    { id: 23, title: "Siwa_Oasis" },
    { id: 24, title: "Naama_Bay" },
    { id: 25, title: "Luxor_Temple" },
    { id: 26, title: "Pyramid_of_Djoser" },
    { id: 27, title: "Colossi_of_Memnon" },
    { id: 28, title: "Temple_of_Edfu" },
    { id: 29, title: "Temple_of_Kom_Ombo" },
    { id: 30, title: "Grand_Egyptian_Museum" },
    { id: 31, title: "Al-Muizz_Street" },
    { id: 32, title: "Mosque_of_Muhammad_Ali" },
    { id: 33, title: "Nubians" },
    { id: 34, title: "Saint_Catherine's_Monastery" },
    { id: 35, title: "Monastery_of_Saint_Simon,_Cairo" },
    { id: 36, title: "Wadi_El_Natrun" },
    { id: 37, title: "Red_Sea_Riviera" },
    { id: 38, title: "Taba,_Egypt" },
    { id: 39, title: "Nuweiba" },
    { id: 40, title: "Colored_Canyon" },
    { id: 41, title: "Dahab" },
    { id: 42, title: "Bibliotheca_Alexandrina" },
    { id: 43, title: "Catacombs_of_Kom_El_Shoqafa" },
    { id: 44, title: "Pharaoh's_Island" }
];

async function fetchImage(title) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800`;
        const req = https.get(url, { headers: { 'User-Agent': 'EgyptTourismApp/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId != '-1' && pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
    });
}

async function run() {
    console.log('⏳ جاري جلب الصور الحقيقية من ويكيبيديا، يرجى الانتظار...');
    const file = path.join(__dirname, 'src', 'constants', 'placesData.js');
    let content = fs.readFileSync(file, 'utf8');
    
    let successCount = 0;
    
    for (const place of wikiPlaces) {
        const url = await fetchImage(place.title);
        if (url) {
            const r = new RegExp(`(id:\\s*${place.id},[\\s\\S]*?imageUrl:\\s*')[^']+(')`);
            content = content.replace(r, `$1${url}$2`);
            successCount++;
        } else {
            console.log(`⚠️ تعذر العثور على صورة لـ: ${place.title}`);
        }
    }
    
    fs.writeFileSync(file, content);
    console.log(`✅ تم الانتهاء بنجاح! تم تركيب ${successCount} صورة حقيقية للأماكن.`);
}

run();
