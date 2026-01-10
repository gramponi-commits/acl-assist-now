import fs from 'fs';
import path from 'path';

const dir = 'src/i18n/locales';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove line containing cannotDeactivate
  const lines = content.split('\n');
  const filtered = lines.filter(line => !line.includes('"cannotDeactivate"'));
  
  fs.writeFileSync(filePath, filtered.join('\n'));
  console.log(`Processed ${file}`);
});

console.log('\nRemoved cannotDeactivate from all translation files');
