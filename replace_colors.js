const fs = require('fs');
const path = require('path');

const files = [
  'Frontend/src/utils/SuperAdminLayout.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/UserManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/StudentManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/TenantManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/CourseManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/PlatformStats.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/PlatformSettings.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/AdminManagement.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/Overview.jsx',
  'Frontend/src/pages/Dashboard/SuperAdmin/Reports.jsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    
    // Convert blue colors to primary / premium-gold logic
    // bg-blue-500 -> bg-primary / dark:bg-premium-gold
    // text-blue-500 -> text-primary / dark:text-premium-gold
    // text-blue-600 -> text-primary / dark:text-premium-gold
    // bg-blue-600 -> bg-primary/90 / dark:bg-premium-gold/90
    // ring-blue-500 -> ring-primary / dark:ring-premium-gold
    // border-blue-500 -> border-primary / dark:border-premium-gold
    
    content = content.replace(/bg-blue-600/g, 'bg-primary dark:bg-premium-gold');
    content = content.replace(/hover:bg-blue-700/g, 'hover:bg-primary/90 dark:hover:bg-premium-gold/90');
    
    content = content.replace(/bg-blue-500\/10/g, 'bg-primary/10 dark:bg-premium-gold/10');
    content = content.replace(/bg-blue-500/g, 'bg-primary dark:bg-premium-gold');
    content = content.replace(/hover:bg-blue-600/g, 'hover:bg-primary/90 dark:hover:bg-premium-gold/90');

    content = content.replace(/text-blue-500/g, 'text-primary dark:text-premium-gold');
    content = content.replace(/text-blue-600/g, 'text-primary dark:text-premium-gold');
    content = content.replace(/text-blue-700/g, 'text-primary dark:text-premium-gold');
    
    content = content.replace(/focus:ring-blue-500/g, 'focus:ring-primary dark:focus:ring-premium-gold');
    content = content.replace(/focus:border-blue-500/g, 'focus:border-primary dark:focus:border-premium-gold');
    content = content.replace(/border-blue-500/g, 'border-primary dark:border-premium-gold');
    content = content.replace(/border-blue-200/g, 'border-primary/20 dark:border-premium-gold/20');
    
    // Light blue backgrounds for active states
    content = content.replace(/bg-blue-50/g, 'bg-primary/5 dark:bg-premium-gold/10');
    content = content.replace(/bg-blue-100\/50/g, 'bg-primary/10 dark:bg-premium-gold/15');
    content = content.replace(/bg-blue-100/g, 'bg-primary/10 dark:bg-premium-gold/15');
    
    // Dark mode subtle backgrounds
    content = content.replace(/dark:bg-blue-900\/30/g, 'dark:bg-premium-gold/20');
    content = content.replace(/dark:bg-blue-900\/20/g, 'dark:bg-premium-gold/15');
    
    // Gradient
    content = content.replace(/from-cyan-500 to-blue-600/g, 'from-primary to-accent-gold');
    content = content.replace(/from-blue-500 to-purple-600/g, 'from-primary to-accent-gold');

    // Button shadows
    content = content.replace(/shadow-blue-500\/20/g, 'shadow-primary/20');

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Updated: ' + file);
    }
  }
});
