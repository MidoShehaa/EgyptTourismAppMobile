const https = require('https');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets', 'places');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const { places } = require('./src/constants/placesData');

async function downloadImage(url, filename) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(path.join(assetsDir, filename));
        https.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                // Handle redirects
                https.get(res.headers.location, (res2) => {
                    res2.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log(`✅ Downloaded: ${filename}`);
                        resolve();
                    });
                });
            } else {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✅ Downloaded: ${filename}`);
                    resolve();
                });
            }
        }).on('error', (err) => {
            console.error(`❌ Error downloading ${filename}:`, err.message);
            resolve();
        });
    });
}

async function run() {
    console.log('🚀 Syncing local assets with real images...');
    for (const place of places) {
        if (place.id <= 10 && place.imageUrl) {
            await downloadImage(place.imageUrl, `place_${place.id}.jpg`);
        }
    }
    console.log('✨ Asset sync complete!');
}

run();
