const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const dir = path.join(rootDir, 'Frontend/src/pages/Dashboard/SuperAdmin');

function fixBlues(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
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
    content = content.replace(/bg-blue-50\b/g, 'bg-primary/10 dark:bg-premium-gold/10');
    content = content.replace(/bg-blue-100\/50/g, 'bg-primary/10 dark:bg-premium-gold/15');
    content = content.replace(/bg-blue-100\b/g, 'bg-primary/10 dark:bg-premium-gold/15');
    content = content.replace(/dark:bg-blue-900\/30/g, 'dark:bg-premium-gold/20');
    content = content.replace(/dark:bg-blue-900\/20/g, 'dark:bg-premium-gold/15');
    content = content.replace(/from-cyan-500 to-blue-600/g, 'from-primary to-accent-gold');
    content = content.replace(/from-blue-500 to-purple-600/g, 'from-primary to-accent-gold');
    content = content.replace(/from-blue-50 to-blue-100/g, 'from-primary/10 to-primary/20');
    content = content.replace(/from-blue-500\/20 to-purple-500\/20/g, 'from-primary/20 to-accent-gold/20');
    content = content.replace(/shadow-blue-500\/20/g, 'shadow-primary/20 dark:shadow-premium-gold/20');

    // Also replace purple ones just in case
    content = content.replace(/bg-purple-100\b/g, 'bg-primary/10 dark:bg-premium-gold/15');
    content = content.replace(/text-purple-700/g, 'text-primary dark:text-premium-gold');
    content = content.replace(/dark:bg-purple-900\/30/g, 'dark:bg-premium-gold/20');
    content = content.replace(/dark:text-purple-400/g, 'text-primary dark:text-premium-gold');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            fixBlues(fullPath);
        }
    });
}

traverse(dir);
