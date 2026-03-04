const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
let depth = 0;
let output = '';

const startLine = 500;
const endLine = 3500;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openTags = (line.match(/<div/g) || []).length;
    const closeTags = (line.match(/<\/div>/g) || []).length;

    if (i + 1 >= startLine && i + 1 <= endLine) {
        output += `${i + 1}: [${depth}] ${line}\n`;
    }

    depth += openTags;
    depth -= closeTags;
}

fs.writeFileSync('depth_check_full.txt', output);
console.log('Done');
