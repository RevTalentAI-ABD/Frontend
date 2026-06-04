const fs = require('fs');
let file = 'src/pages/PublicJobBoard.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div className="jb-hero-badge">.*?We're hiring<\/div>/, '<div className="jb-hero-badge">We\\'re hiring</div>');
fs.writeFileSync(file, content);
console.log('Fixed');
