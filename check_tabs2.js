const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

let openDivs = 0;
const lines = html.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // some tags might be <div ...> and </div> on the same line.
    const opens = (line.match(/<div(\s+[^>]*)?>/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;

    openDivs += opens;

    if (line.toLowerCase().includes('id=\"m1-entregables\"')) {
        console.log('m1-entregables matched at line', i + 1, 'open divs:', openDivs);
    }
    if (line.toLowerCase().includes('id=\"m1-practica\"')) {
        console.log('m1-practica matched at line', i + 1, 'open divs:', openDivs);
    }

    openDivs -= closes;

    if (openDivs < 0) {
        console.log('WARNING: openDivs went negative at line', i + 1, 'Line:', line.trim());
        // Reset to 0 to find more
        openDivs = 0;
    }
}
console.log('Final open divs:', openDivs);
