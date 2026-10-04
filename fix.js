const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf-8');
content = content.replace('solc >= 0.6.0', 'solc &gt;= 0.6.0');

// Add </main> before {/* Slide-over Sheets */}
content = content.replace('{/* Slide-over Sheets */}', '</main>\n      {/* Slide-over Sheets */}');

fs.writeFileSync('app/page.tsx', content);
