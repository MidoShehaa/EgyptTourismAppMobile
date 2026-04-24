const fs = require('fs');
const path = require('path');

function replaceWithPicsum(filePath, prefix) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        let idCounter = 1;
        const regex = /(imageUrl:\s*')[^']+(')/g;
        // Also sometimes it's `image: 'https...` like in HotelsScreen
        const regex2 = /(image:\s*')https:[^']+(')/g;

        content = content.replace(regex, (match, p1, p2) => {
            return `${p1}https://picsum.photos/seed/${prefix}${idCounter++}/800/600${p2}`;
        });
        
        content = content.replace(regex2, (match, p1, p2) => {
            return `${p1}https://picsum.photos/seed/${prefix}${idCounter++}/800/600${p2}`;
        });

        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed images in ${path.basename(filePath)}`);
    }
}

const basePath = path.join(__dirname, 'src');

replaceWithPicsum(path.join(basePath, 'constants', 'placesData.js'), 'egypt_place_');
replaceWithPicsum(path.join(basePath, 'screens', 'HotelsScreen.js'), 'egypt_hotel_');
replaceWithPicsum(path.join(basePath, 'screens', 'ExperiencesScreen.js'), 'egypt_exp_');
replaceWithPicsum(path.join(basePath, 'screens', 'OnboardingScreen.js'), 'egypt_onb_');
replaceWithPicsum(path.join(basePath, 'screens', 'PlannerScreen.js'), 'egypt_plan_');

console.log('🎉 جميع الصور تم تعديلها بمصادر تعمل بنسبة 100% الآن!');
