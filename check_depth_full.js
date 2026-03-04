const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

const panelIds = ['m4-teoria', 'm4-estrella', 'm4-dashboard', 'm4-practica', 'm4-entregables', 'm4-quiz'];

panelIds.forEach(id => {
    let depth = 0;
    let foundStart = false;
    let foundEnd = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i] || '';

        if (line.includes(`id="${id}"`)) {
            foundStart = true;
        }

        if (foundStart && !foundEnd) {
            depth += (line.match(/<div/g) || []).length;
            depth -= (line.match(/<\/div>/g) || []).length;

            if (depth === 0) {
                console.log(`Panel ${id} ends at line ${i}`);
                foundEnd = true;
            }
        }
    }

    if (!foundStart) {
        console.log(`Panel ${id} NOT FOUND!`);
    } else if (!foundEnd) {
        console.log(`Panel ${id} NEVER CLOSES! Depth remains at >0.`);
    }
});
