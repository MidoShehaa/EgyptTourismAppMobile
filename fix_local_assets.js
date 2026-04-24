const https = require('https');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets', 'places');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const places = [
    { id: 1, title: "Giza_Necropolis" },
    { id: 2, title: "Karnak" },
    { id: 3, title: "Egyptian_Museum" },
    { id: 4, title: "Khan_el-Khalili" },
    { id: 5, title: "Ras_Muhammad_National_Park" },
    { id: 6, title: "Abu_Simbel_temples" },
    { id: 7, title: "Valley_of_the_Kings" },
    { id: 8, title: "Luxor_Temple" },
    { id: 9, title: "Blue_Hole_(Red_Sea)" },
    { id: 10, title: "Giftun_Islands" } // Mahmaya
];

async function downloadImage(url, filename) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(path.join(assetsDir, filename));
        https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            console.error(`❌ Error downloading ${filename}:`, err.message);
            resolve();
        });
    });
}

async function getWikiImageUrl(title) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=1000`;
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
    console.log('🚀 Starting deep image fix for local assets...');
    for (const place of places) {
        const imageUrl = await getWikiImageUrl(place.title);
        if (imageUrl) {
            await downloadImage(imageUrl, `place_${place.id}.jpg`);
        } else {
            console.log(`⚠️ Could not find image for ${place.title}`);
        }
    }
    console.log('✨ Local assets update complete!');
}

run();
