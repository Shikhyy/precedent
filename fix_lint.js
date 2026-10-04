const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');
content = content.replace('ShieldCheck, ', '');
content = content.replace('GitCompare, ', '');
fs.writeFileSync('app/page.tsx', content);
