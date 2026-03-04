const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');
let depth = 0;
let out = '';
for (let i = 1490; i < 2520; i++) {
    const ln = lines[i] || '';
    if (ln.includes('<section')) depth++;
    if (ln.includes('</section')) depth--;
    depth += (ln.match(/<div/g) || []).length;
    depth -= (ln.match(/<\/div>/g) || []).length;
    if (depth > 2 && !ln.includes('</section') && i >= 2490) {
        out += `L${i + 1}: d=${depth} | ${ln.trim().substring(0, 50)}\n`;
    }
}
fs.writeFileSync('m1_trace_end.txt', out);
