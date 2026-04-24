const fs = require('fs');
const https = require('https');
const path = require('path');

// Mapping IDs to their exact and verified Wikipedia English page titles to ensure high-quality, authentic images
const placesTitles = {
    1: 'Giza_Necropolis',
    2: 'Egyptian_Museum',
    3: 'Khan_el-Khalili',
    4: 'Karnak',
    5: 'Red_Sea',
    6: 'Abu_Simbel_temples',
    7: 'Valley_of_the_Kings',
    8: 'Luxor_Temple',
    9: 'Ras_Muhammad_National_Park',
    10: 'Blue_Hole_(Red_Sea)',
    11: 'Mount_Sinai',
    12: 'Coloured_Canyon_(Egypt)', // Corrected wiki title
    13: 'Saint_Catherine\'s_Monastery',
    14: 'Abu_Galum',
    15: 'Nuweiba',
    16: 'Cairo_Citadel', // Salah El Din Citadel
    17: 'Al-Azhar_Mosque',
    18: 'Hanging_Church',
    19: 'Philae',
    20: 'Mortuary_Temple_of_Hatshepsut',
    21: 'Naama_Bay',
    22: 'Citadel_of_Qaitbay',
    23: 'White_Desert_National_Park',
    24: 'Siwa_Oasis'
};

async function fetchImage(title) {
    return new Promise((resolve) => {
        // pithumbsize=1000 to get a high quality image for the mobile app
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=1000`;
        const options = {
            headers: {
                // Wikipedia blocks requests without User-Agent
                'User-Agent': 'EgyptTourismApp/1.0 (mido.dev@example.com) Node.js'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId] && pages[pageId].thumbnail) {
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
    console.log("=== Starting Verified Images Search (Wikipedia) ===");
    const filePath = path.join(__dirname, 'src', 'constants', 'placesData.js');

    if (!fs.existsSync(filePath)) {
        console.error("Error: Could not find src/constants/placesData.js");
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let successCount = 0;

    for (const [id, title] of Object.entries(placesTitles)) {
        console.log(`[ID: ${id}] Fetching genuine image for: ${title.replace(/_/g, ' ')}...`);
        const imageUrl = await fetchImage(title);

        if (imageUrl) {
            // Regex to find and replace the imageUrl line for exactly the current Place ID
            const regex = new RegExp(`(id:\\s*${id},[\\s\\S]*?imageUrl:\\s*')[^']+(')`);
            if (regex.test(content)) {
                content = content.replace(regex, `$1${imageUrl}$2`);
                console.log(`  ✅ Success: Uploaded verified image.`);
                successCount++;
            } else {
                console.log(`  ❌ Error: Could not parse target imageUrl in placesData.js for ID ${id}`);
            }
        } else {
            console.log(`  ⚠️ Warning: No cover image found on Wikipedia for ${title}, keeping the old one.`);

            // Fallback: If Wikipedia fails, let's inject a known good reliable URL for some specific places just in case
            if (id == 12) {
                content = content.replace(/(id:\s*12,[\s\S]*?imageUrl:\s*')[^']+(')/, `$1https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Colored_Canyon_Sinai.jpg/800px-Colored_Canyon_Sinai.jpg$2`);
                console.log("  ✅ Applied Wikipedia fallback image for Colored Canyon.");
            }
        }
    }

    fs.writeFileSync(filePath, content);
    console.log(`\n=== Done! Successfully updated ${successCount} authentic images in placesData.js ===`);
}

run();
