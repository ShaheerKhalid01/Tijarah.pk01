const fs = require('fs');
const path = require('path');

function checkFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkFiles(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('useState(') || content.includes('useEffect(') || content.includes('useContext(') || content.includes('useTranslations(')) {
                if (!content.includes("'use client'") && !content.includes('"use client"')) {
                    console.log(`MISSING: ${fullPath}`);
                }
            }
        }
    });
}

console.log('--- Scanning app/ ---');
checkFiles('./app');
console.log('--- Scanning components/ ---');
checkFiles('./components');
