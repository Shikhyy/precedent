const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf-8');
content = content.replace('ExternalLink, Terminal, Shield } from "lucide-react";', 'ExternalLink, Terminal, Shield, GitCompare, ShieldCheck } from "lucide-react";');
fs.writeFileSync('app/page.tsx', content);
