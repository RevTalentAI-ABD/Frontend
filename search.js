const fs = require('fs');
const path = require('path');
function search(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      search(p);
    } else if (p.endsWith('.js') || p.endsWith('.jsx')) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('VITE_API_URL')) {
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (line.includes('VITE_API_URL')) {
            console.log(p + ':' + (i + 1) + ': ' + line.trim());
          }
        });
      }
    }
  }
}
search('c:/Users/hp/New folder/Desktop/revtalent/Frontend/src');
