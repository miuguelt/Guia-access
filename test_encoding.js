const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
let sub = content.substring(0, 1000);

console.log("Original corrupted:");
console.log(sub);

console.log("\n\nReversed mojibake:");
try {
    let rev = Buffer.from(sub, 'latin1').toString('utf8');
    console.log(rev);
} catch (e) {
    console.log("Error:", e);
}
