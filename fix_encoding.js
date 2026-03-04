const fs = require('fs');

const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
    "Ã³": "ó", "Ã¡": "á", "Ã©": "é", "Ã­": "í", "Ãº": "ú",
    "Ã±": "ñ", "Ã“": "Ó", "Ã‰": "É", "Ã ": "Á", "Ãš": "Ú",
    "Ã‘": "Ñ", "â€¦": "…", "â€“": "–", "Ã¼": "ü", "Â¿": "¿", "Â¡": "¡",
    "ðŸ§¬": "🧬", "Ã": "í"
};

const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);

for (const key of keys) {
    content = content.split(key).join(replacements[key]);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Encoding fully restored and written as UTF-8.');
