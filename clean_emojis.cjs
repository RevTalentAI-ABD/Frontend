const fs = require('fs');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace emojis in toast messages
  content = content.replace(/showToast\([\'\`\"](?:❌|✅|⚠️)(.*?)(?:❌|✅|⚠️)?[\'\`\"]\)/g, 'showToast(\'$1\')');

  // Emojis in JSX
  content = content.replace(/🤖/g, '');
  content = content.replace(/📅/g, ''); 
  content = content.replace(/👤/g, '');
  content = content.replace(/📄/g, '');
  content = content.replace(/✕/g, '');
  content = content.replace(/🗑/g, 'Remove');
  content = content.replace(/↩/g, '');
  content = content.replace(/💼/g, '');
  content = content.replace(/👥/g, '');
  content = content.replace(/→/g, '');
  content = content.replace(/🎉/g, '');
  content = content.replace(/🏆/g, '');

  fs.writeFileSync(filePath, content);
}

const files = [
  'src/components/PageRecruitment.jsx',
  'src/pages/Pagerecruitment.jsx',
  'src/pages/PageMyReviews.jsx',
  'src/pages/PublicJobBoard.jsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    cleanFile(file);
    console.log('Cleaned ' + file);
  }
}
