const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const files = [
  'Frontend/src/pages/Dashboard/SuperAdmin/UserManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/StudentManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/TenantManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/Overview.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/PlatformStats.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/PlatformSettings.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/AdminManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/CourseManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/Reports.jsx'
];

files.forEach(file => {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    
    content = content.replace(/bg-blue-600/g, 'bg-primary dark:bg-premium-gold');
    content = content.replace(/hover:bg-blue-700/g, 'hover:scale-105 hover:brightness-110');
    content = content.replace(/bg-blue-500\/10/g, 'bg-primary/10 dark:bg-premium-gold/10');
    content = content.replace(/bg-blue-500/g, 'bg-primary dark:bg-premium-gold');
    content = content.replace(/hover:bg-blue-600/g, 'hover:brightness-110');

    content = content.replace(/text-blue-500/g, 'text-primary dark:text-premium-gold');
    content = content.replace(/text-blue-600/g, 'text-primary dark:text-premium-gold');
    content = content.replace(/text-blue-700/g, 'text-primary dark:text-premium-gold');
    content = content.replace(/text-blue-300/g, 'text-primary dark:text-premium-gold');
    content = content.replace(/text-blue-400/g, 'text-primary dark:text-premium-gold');
    content = content.replace(/text-blue-800/g, 'text-primary dark:text-premium-gold');
    
    content = content.replace(/focus:ring-blue-500/g, 'focus:ring-primary dark:focus:ring-premium-gold');
    content = content.replace(/focus:border-blue-500/g, 'focus:border-primary dark:focus:border-premium-gold');
    content = content.replace(/border-blue-500/g, 'border-primary dark:border-premium-gold');
    content = content.replace(/border-blue-200/g, 'border-primary/20 dark:border-premium-gold/20');
    
    // Light blue backgrounds for active states
    content = content.replace(/bg-blue-50\b/g, 'bg-primary/10 dark:bg-premium-gold/10');
    content = content.replace(/bg-blue-100\/50/g, 'bg-primary/10 dark:bg-premium-gold/15');
    content = content.replace(/bg-blue-100\b/g, 'bg-primary/10 dark:bg-premium-gold/15');
    
    // Dark mode subtle backgrounds
    content = content.replace(/dark:bg-blue-900\/30/g, 'dark:bg-premium-gold/20');
    content = content.replace(/dark:bg-blue-900\/20/g, 'dark:bg-premium-gold/15');
    
    // Gradients
    content = content.replace(/from-cyan-500 to-blue-600/g, 'from-primary to-accent-gold');
    content = content.replace(/from-blue-500 to-purple-600/g, 'from-primary to-accent-gold');
    content = content.replace(/from-blue-50 to-blue-100/g, 'from-primary/10 to-primary/20');
    content = content.replace(/from-blue-500\/20 to-purple-500\/20/g, 'from-primary/20 to-accent-gold/20');
    
    // Shadows
    content = content.replace(/shadow-blue-500\/20/g, 'shadow-primary/20 dark:shadow-premium-gold/20');

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Updated: ' + fullPath);
    } else {
      console.log('No blue references found or already changed in ' + fullPath);
    }
  } else {
    console.log('Not found: ' + fullPath);
  }
});
