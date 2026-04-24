const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets', 'places');
const fallbackImage = path.join(assetsDir, 'place_1.jpg'); // Pyramids image, guaranteed to work from previous steps

function fixCorruptedImages() {
    if (!fs.existsSync(assetsDir)) return;
    
    // Check if fallback exists
    if (!fs.existsSync(fallbackImage)) {
        console.log('Fallback image place_1.jpg does not exist. Cannot fix automatically.');
        return;
    }

    const files = fs.readdirSync(assetsDir);
    let fixedCount = 0;

    for (const file of files) {
        if (!file.endsWith('.jpg')) continue;
        
        const filePath = path.join(assetsDir, file);
        
        try {
            // Read first few bytes to check if it's a valid JPEG (FF D8 FF)
            const buffer = Buffer.alloc(3);
            const fd = fs.openSync(filePath, 'r');
            fs.readSync(fd, buffer, 0, 3, 0);
            fs.closeSync(fd);

            // FF D8 FF are the magic bytes for JPEG
            if (buffer[0] !== 0xFF || buffer[1] !== 0xD8 || buffer[2] !== 0xFF) {
                console.log(`⚠️ الملف ${file} معطوب (ليس صورة حقيقية). جاري استبداله بصورة بديلة...`);
                // Replace corrupted file with the fallback image
                fs.copyFileSync(fallbackImage, filePath);
                fixedCount++;
            }
        } catch (e) {
            console.log(`❌ خطأ في فحص ${file}:`, e.message);
        }
    }
    
    console.log(`\n✅ تم الانتهاء من عملية الفحص! تم إصلاح ${fixedCount} صور معطوبة.`);
}

fixCorruptedImages();
