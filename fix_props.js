const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf-8');
content = content.replace('controllingIds={', 'controllingClaimIds={');
content = content.replace('overruledIds={', 'overruledClaimIds={');
fs.writeFileSync('app/page.tsx', content);
