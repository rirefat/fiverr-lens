import fs from 'fs';

let content = fs.readFileSync('src/complianceDatabase.ts', 'utf8');
content = content.replace(/whats\\\\s\?app/g, 'whatsapp');
content = content.replace(/phone\\\\s\?number/g, 'phone number');
content = content.replace(/\\\\s\?/g, ' ');

fs.writeFileSync('src/complianceDatabase.ts', content);
