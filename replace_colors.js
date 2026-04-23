const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

function traverseAndReplace(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseAndReplace(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Update saffron variables to primary
      content = content.replace(/var\(--color-saffron\)/g, 'var(--color-primary)');
      content = content.replace(/var\(--color-saffron-dark\)/g, 'var(--color-primary-dark)');
      content = content.replace(/var\(--bg-saffron-subtle\)/g, 'var(--color-cream)');
      content = content.replace(/var\(--shadow-saffron\)/g, 'var(--shadow-primary)');
      
      // Update hardcoded #FF9933 or #FF5D5D to var(--color-primary) if any remain
      content = content.replace(/#FF9933/gi, 'var(--color-primary)');
      content = content.replace(/#FF5D5D/gi, 'var(--color-primary)');
      content = content.replace(/#e04a4a/gi, 'var(--color-primary)');
      content = content.replace(/#b83232/gi, 'var(--color-primary-dark)');
      content = content.replace(/#ffc107/gi, 'var(--color-warning)'); // sometimes used for medium
      content = content.replace(/#28a745/gi, 'var(--color-success)'); // sometimes used for low
      
      // Update rgba soft reds/saffrons to a soft primary/cream
      content = content.replace(/rgba\(\s*255\s*,\s*153\s*,\s*51/g, 'rgba(197, 168, 128');
      content = content.replace(/rgba\(\s*255\s*,\s*93\s*,\s*93/g, 'rgba(197, 168, 128');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

traverseAndReplace(srcDir);
console.log('Done updating variables to soft minimal theme.');
