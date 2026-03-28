const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  'bg-slate-50': 'bg-parchment-50',
  'bg-slate-100': 'bg-parchment-100',
  'bg-slate-200': 'bg-parchment-200',
  'bg-slate-800': 'bg-ink-800',
  'bg-slate-900': 'bg-ink-900',
  'border-slate-100': 'border-parchment-200',
  'border-slate-200': 'border-parchment-200',
  'border-slate-300': 'border-parchment-300',
  'border-slate-700': 'border-parchment-300',
  'text-slate-900': 'text-ink-900',
  'text-slate-800': 'text-ink-900',
  'text-slate-700': 'text-ink-800',
  'text-slate-600': 'text-ink-800',
  'text-slate-500': 'text-ink-800',
  'text-slate-400': 'text-ink-800',
  'text-slate-300': 'text-parchment-100', // for dark backgrounds
  'bg-indigo-50': 'bg-parchment-100', // hover backgrounds
  'bg-indigo-100': 'bg-parchment-200', // accents
  'bg-indigo-600': 'bg-accent-primary',
  'bg-indigo-700': 'bg-accent-hover',
  'bg-indigo-900': 'bg-ink-900',
  'text-indigo-200': 'text-parchment-200',
  'text-indigo-300': 'text-parchment-300',
  'text-indigo-400': 'text-accent-primary',
  'text-indigo-500': 'text-accent-primary',
  'text-indigo-600': 'text-accent-primary',
  'text-indigo-700': 'text-accent-hover',
  'text-indigo-800': 'text-ink-800',
  'text-indigo-900': 'text-ink-900',
  'border-indigo-100': 'border-parchment-200',
  'border-indigo-200': 'border-parchment-300',
  'border-indigo-500': 'border-accent-primary',
  'border-indigo-600': 'border-accent-primary'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

try {
  const files = walk(directoryPath);
  let changedFilesCount = 0;
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    
    // Perform replacements globally
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(key, 'g');
      content = content.replace(regex, value);
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated: ${path.basename(file)}`);
      changedFilesCount++;
    }
  });
  console.log(`Successfully migrated ${changedFilesCount} files to parchment theme.`);
} catch (error) {
  console.error('Error during migration:', error);
}
