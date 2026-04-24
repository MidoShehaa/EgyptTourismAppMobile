const fs = require('fs');
const path = require('path');
const https = require('https');

const assetsDir = path.join(__dirname, 'assets', 'places');
const dataFile = path.join(__dirname, 'src', 'constants', 'placesData.js');

// Ensure assets/places directory exists
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, { headers: { 'User-Agent': 'EgyptTourismApp/1.0' } }, function (response) {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // handle redirects if necessary (most wiki images don't redirect, but picsum does)
                https.get(response.headers.location, { headers: { 'User-Agent': 'EgyptTourismApp/1.0' } }, function(res2) {
                     res2.pipe(file);
                     file.on('finish', () => { file.close(resolve); });
                }).on('error', (err) => { fs.unlink(dest, () => reject(err)); });
            } else {
                response.pipe(file);
                file.on('finish', () => { file.close(resolve); });
            }
        }).on('error', function (err) {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function runOfflineBundler() {
    console.log('🚀 بدء عملية جلب جميع الصور وحفظها داخل التطبيق لتعمل بدون إنترنت (الأوفلاين)...');
    let content = fs.readFileSync(dataFile, 'utf8');
    
    // Find all URL matches
    const regex = /id:\s*(\d+),[\s\S]*?imageUrl:\s*'([^']+)'/g;
    let match;
    const updates = [];

    // Pause briefly to collect matches
    while ((match = regex.exec(content)) !== null) {
        updates.push({ id: match[1], url: match[2], fullMatch: match[0] });
    }

    let successCount = 0;
    
    for (const item of updates) {
        const fileName = `place_${item.id}.jpg`;
        const destPath = path.join(assetsDir, fileName);
        
        console.log(`⏳ تحميل صورة المعلم رقم ${item.id}...`);
        try {
            await downloadImage(item.url, destPath);
            // Verify size to ensure it wasn't a 404 HTML page
            const stats = fs.statSync(destPath);
            if (stats.size < 1000) {
                 throw new Error('الملف صغير جداً غالباً ليس صورة');
            }
            
            // Rewrite imageUrl to localAsset inside placesData.js
            // To not break existing code entirely, we will add 'imageSource: require("../../assets/places/place_X.jpg")'
            const replacement = item.fullMatch + `,\n        imageSource: require('../../assets/places/${fileName}')`;
            
            // Only add if not already added
            if (!content.includes(`require('../../assets/places/${fileName}')`)) {
                content = content.replace(item.fullMatch, replacement);
            }
            successCount++;
        } catch (e) {
            console.log(`❌ فشل تحميل صورة المعلم رقم ${item.id}: ${e.message}`);
        }
    }

    // Write back to placesData.js
    fs.writeFileSync(dataFile, content);
    console.log(`\n🎉 تم بنجاح! تم تحميل ${successCount} صورة وربطها بالكود مباشرة لتصبح الصور 100% داخل مساحة التطبيق ولن تختفي أبداً!`);
}

runOfflineBundler();
