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
      
      const primarySoft = '#c7ad88'; // soft gold/neutral
      const primaryDarkSoft = '#b0946d';
      
      // Reds to replace
      const reds = [
        '#FF5D5D', '#ff5d5d',
        '#e04a4a', '#E04A4A',
        '#c03939', '#C03939',
        '#d62828', '#D62828',
        '#c43737', '#C43737',
        '#e04848', '#E04848'
      ];
      
      reds.forEach(red => {
        // use regex to catch all
        const regex = new RegExp(red, 'g');
        content = content.replace(regex, primarySoft);
      });
      
      // RGBA replacements
      content = content.replace(/rgba\(\s*255\s*,\s*93\s*,\s*93/g, 'rgba(199, 173, 136');
      content = content.replace(/rgba\(\s*224\s*,\s*74\s*,\s*74/g, 'rgba(199, 173, 136');
      
      // Background `#fff5f5` or `#fff6f6` to `#fdfdfd` (soft white/neutral)
      content = content.replace(/#fff5f5/g, '#fafafa');
      content = content.replace(/#fff6f6/g, '#fafafa');
      content = content.replace(/#ffe5e5/g, '#fafafa');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

traverseAndReplace(srcDir);
console.log('Done refining colors.');
