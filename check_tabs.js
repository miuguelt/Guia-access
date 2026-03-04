const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const m1TabsMatch = html.match(/id=\"(m1-[a-z]+)\"/g);
console.log('Found m1 ids:', Array.from(new Set(m1TabsMatch)));

let openDivs = 0;
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div[^>]*>/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    openDivs += opens;
    if (line.includes('id=\"m1-entregables\"')) {
        console.log('m1-entregables found at line', i + 1, 'open divs:', openDivs);
    }
    if (line.includes('id=\"m1-practica\"')) {
        console.log('m1-practica found at line', i + 1, 'open divs:', openDivs);
    }
    openDivs -= closes;
}
console.log('Final open divs:', openDivs);
