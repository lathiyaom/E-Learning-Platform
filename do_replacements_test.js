const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'Frontend', 'src', 'pages', 'Dashboard', 'SuperAdmin');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    // text and border
    .replace(/text-purple-600/g, 'text-primary')
    .replace(/text-purple-700/g, 'text-primary')
    .replace(/text-purple-500/g, 'text-primary')
    .replace(/text-purple-400/g, 'dark:text-accent-gold text-primary')
    
    .replace(/text-blue-700/g, 'text-primary dark:text-accent-gold')
    .replace(/text-blue-500/g, 'text-primary dark:text-accent-gold')
    .replace(/text-blue-400/g, 'text-primary dark:text-accent-gold')

    .replace(/border-blue-500/g, 'border-primary')
    
    // backgrounds
    .replace(/bg-purple-100/g, 'bg-primary/20')
    .replace(/bg-purple-500\/10/g, 'bg-primary/10 dark:bg-premium-gold/10')
    .replace(/bg-purple-500\/20/g, 'bg-primary/20 dark:bg-premium-gold/20')
    .replace(/bg-purple-900\/30/g, 'dark:bg-primary/20')
    .replace(/bg-purple-900/g, 'dark:bg-primary/20')

    .replace(/bg-blue-100/g, 'bg-primary/20')
    .replace(/bg-blue-500\/10/g, 'bg-primary/10')
    .replace(/bg-blue-500\/20/g, 'bg-primary/20')
    .replace(/bg-blue-900\/30/g, 'dark:bg-primary/20')
    .replace(/bg-blue-500/g, 'bg-primary dark:bg-premium-gold text-white')
    .replace(/bg-blue-600/g, 'bg-primary/90 dark:bg-premium-gold/90 text-white')
    .replace(/hover:bg-blue-600/g, 'hover:bg-primary/90 dark:hover:bg-premium-gold/90')
    .replace(/hover:bg-blue-500/g, 'hover:bg-primary/90 dark:hover:bg-premium-gold/90')
    
    // rings
    .replace(/focus:ring-blue-500/g, 'focus:ring-primary')
    .replace(/focus:border-blue-500/g, 'focus:border-primary')
    
    // gradients
    .replace(/bg-gradient-to-br from-blue-500 to-purple-600/g, 'bg-gradient-to-br from-primary to-accent-gold')
    .replace(/bg-gradient-to-r from-blue-500 to-purple-600/g, 'bg-gradient-to-r from-primary to-accent-gold')
    .replace(/from-blue-500 to-blue-600/g, 'from-primary to-accent-gold');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  } else {
    console.log('No changes needed in ' + file);
  }
}

function run() {
  const files = [
    'UserManagement.jsx',
    'TenantManagement.jsx',
    'TenantDetail.jsx',
    'Analytics.jsx',
    'SuperAdminDashboard.jsx',
    'StudentManagement.jsx'
  ];
  
  files.forEach(f => {
    try {
      processFile(path.join(dir, f));
    } catch (e) {
      console.log('Error processing ' + f, e.message);
    }
  });
}

run();
