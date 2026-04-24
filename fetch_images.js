const https = require('https');

const places = [
    { id: 1, title: "Giza_Necropolis" },
    { id: 2, title: "Egyptian_Museum" },
    { id: 3, title: "Khan_el-Khalili" },
    { id: 4, title: "Karnak" },
    { id: 5, title: "Red_Sea" },
    { id: 6, title: "Abu_Simbel_temples" },
    { id: 7, title: "Valley_of_the_Kings" },
    { id: 8, title: "Luxor_Temple" },
    { id: 9, title: "Ras_Muhammad_National_Park" },
    { id: 10, title: "Blue_Hole_(Red_Sea)" },
    { id: 11, title: "Mount_Sinai" },
    { id: 12, title: "Colored_Canyon" },
    { id: 13, title: "Saint_Catherine's_Monastery" },
    { id: 14, title: "Ras_Abu_Galum" },
    { id: 15, title: "Nuwayba" }, // Fallback for Wadi El Wishwesh
    { id: 16, title: "Cairo_Citadel" },
    { id: 17, title: "Al-Azhar_Mosque" },
    { id: 18, title: "Hanging_Church" },
    { id: 19, title: "Philae" },
    { id: 20, title: "Mortuary_Temple_of_Hatshepsut" },
    { id: 21, title: "Naama_Bay" },
    { id: 22, title: "Citadel_of_Qaitbay" },
    { id: 23, title: "White_Desert_National_Park" },
    { id: 24, title: "Siwa_Oasis" }
];

async function fetchImage(title) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=800`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function run() {
    const results = {};
    for (const place of places) {
        const url = await fetchImage(place.title);
        results[place.id] = url;
    }
    console.log(JSON.stringify(results, null, 2));
}

run();
