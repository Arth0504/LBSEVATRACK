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
      
      // Replace red/pink hex with saffron hex/vars
      content = content.replace(/#FF5D5D/gi, 'var(--color-saffron)');
      content = content.replace(/#e04848/gi, 'var(--color-saffron-dark)');
      content = content.replace(/#fef1f1/gi, 'var(--bg-saffron-subtle)');
      
      // Replace rgba(255, 93, 93, ...) with rgba(255, 153, 51, ...)
      content = content.replace(/rgba\(\s*255\s*,\s*93\s*,\s*93/g, 'rgba(255, 153, 51');
      
      // Replace some red text colors with saffron
      content = content.replace(/color:\s*red/gi, 'color: var(--color-danger)');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

traverseAndReplace(srcDir);
console.log('Done replacing colors.');
