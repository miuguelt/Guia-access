const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
let depth = 0;
let out = '';
for (let i = 5835; i < 6465; i++) {
    const ln = lines[i] || '';
    if (ln.includes('<section')) depth++;
    if (ln.includes('</section')) depth--;
    depth += (ln.match(/<div/g) || []).length;
    depth -= (ln.match(/<\/div>/g) || []).length;
    if (depth < 4 && !ln.includes('</section')) {
        out += `L${i + 1}: d=${depth} | ${ln.trim().substring(0, 50)}\n`;
    }
}
fs.writeFileSync('m4_trace_deep.txt', out);
