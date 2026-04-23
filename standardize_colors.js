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
      
      // 1. Primary Colors -> var(--color-primary)
      const primaryColors = [
        '#c7ad88', '#C7AD88',
        '#b0946d', '#B0946D',
        '#FF5D5D', '#ff5d5d',
        '#e04a4a', '#E04A4A',
        '#c03939', '#C03939',
        '#d62828', '#D62828',
        '#c43737', '#C43737',
        '#e04848', '#E04848',
        '#2196F3', '#2196f3',
        '#1976d2', '#1976D2',
        '#ff9800', '#FF9800',
        '#e68900', '#E68900',
        '#f44336', '#F44336',
        '#d32f2f', '#D32F2F',
        '#4CAF50', '#4caf50',
        '#3e9443', '#3E9443',
        '#28a745', '#28A745',
        '#007bff', '#007BFF',
        '#ffc107', '#FFC107',
        'orange'
      ];
      
      primaryColors.forEach(color => {
        // use regex to catch all, word boundary doesn't work well with #
        const regex = new RegExp(color + '(?![a-zA-Z0-9])', 'g');
        content = content.replace(regex, 'var(--color-primary)');
      });

      // Also handle rgb/rgba for primary color shadows/backgrounds
      // e.g. rgba(255, 93, 93, 0.3) -> rgba(74, 144, 226, 0.3)
      content = content.replace(/rgba\(\s*255\s*,\s*93\s*,\s*93/g, 'rgba(74, 144, 226');
      content = content.replace(/rgba\(\s*224\s*,\s*74\s*,\s*74/g, 'rgba(74, 144, 226');
      content = content.replace(/rgba\(\s*199\s*,\s*173\s*,\s*136/g, 'rgba(74, 144, 226');
      
      // 2. Borders -> var(--border-color)
      const borderColors = ['#ddd', '#eee', '#ccc', '#f0f0f0'];
      borderColors.forEach(color => {
        const regex = new RegExp(color + '(?![a-zA-Z0-9])', 'g');
        content = content.replace(regex, 'var(--border-color)');
      });
      
      // 3. Text colors -> var(--text-primary) or var(--text-secondary)
      content = content.replace(/#333(?![a-zA-Z0-9])/g, 'var(--text-primary)');
      content = content.replace(/#222(?![a-zA-Z0-9])/g, 'var(--text-primary)');
      content = content.replace(/#444(?![a-zA-Z0-9])/g, 'var(--text-primary)');
      content = content.replace(/#555(?![a-zA-Z0-9])/g, 'var(--text-secondary)');
      content = content.replace(/#666(?![a-zA-Z0-9])/g, 'var(--text-secondary)');
      content = content.replace(/#888(?![a-zA-Z0-9])/g, 'var(--text-secondary)');
      content = content.replace(/#aaa(?![a-zA-Z0-9])/g, 'var(--text-secondary)');
      
      // 4. Backgrounds -> var(--bg-main)
      const bgColors = ['#f9fafc', '#fafafa', '#f5f5f5', '#f4f6f9', '#f9f9f9', '#fdfdfd', '#fff5f5', '#fff6f6', '#ffe5e5'];
      bgColors.forEach(color => {
        const regex = new RegExp(color + '(?![a-zA-Z0-9])', 'g');
        content = content.replace(regex, 'var(--bg-main)');
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

traverseAndReplace(srcDir);
console.log('Done standardizing colors.');
