const fs = require('fs');
const path = require('path');

function replaceAllColors(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove purple
    content = content.replace(/purple-100/g, 'primary/20');
    content = content.replace(/purple-700/g, 'primary');
    content = content.replace(/purple-900\/30/g, 'premium-gold/30');
    content = content.replace(/purple-400/g, 'premium-gold');
    content = content.replace(/purple-500\/10/g, 'primary/10 dark:bg-premium-gold/10');
    content = content.replace(/purple-500/g, 'primary dark:text-premium-gold');
    content = content.replace(/purple-600/g, 'accent-gold');
    content = content.replace(/purple-100/g, 'primary/10');
    content = content.replace(/purple-50 /g, 'primary/5 ');
    content = content.replace(/purple-900\/20/g, 'premium-gold/20');

    // Remove blue
    content = content.replace(/blue-100/g, 'primary/10');
    content = content.replace(/blue-700/g, 'primary');
    content = content.replace(/blue-900\/30/g, 'premium-gold/30');
    content = content.replace(/blue-400/g, 'premium-gold');
    content = content.replace(/blue-500\/10/g, 'primary/10 dark:bg-premium-gold/10');
    content = content.replace(/blue-500/g, 'primary dark:text-premium-gold');
    content = content.replace(/blue-600/g, 'accent-gold');
    content = content.replace(/blue-50 /g, 'primary/5 ');
    content = content.replace(/blue-900\/20/g, 'premium-gold/20');

    // Convert old gradients
    content = content.replace(/from-primary dark:text-premium-gold to-accent-gold/g, 'from-primary to-accent-gold');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed:', filePath);
    }
}

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            replaceAllColors(fullPath);
        }
    });
}

traverse(path.join(process.cwd(), 'Frontend/src/pages/Dashboard/SuperAdmin'));
