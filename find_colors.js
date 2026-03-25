const fs = require('fs');
const path = require('path');
function searchRec(dir) {
  let hasBlue = false;
  fs.readdirSync(dir).forEach(file => {
    let fp = path.join(dir, file);
    if(fs.statSync(fp).isDirectory()) {
      hasBlue = searchRec(fp) || hasBlue;
    } else if (fp.endsWith('.jsx')) {
      let c = fs.readFileSync(fp,'utf8');
      if (c.match(/blue-/)) { console.log('Found blue in ' + fp); hasBlue=true; }
      if (c.match(/purple-/)) { console.log('Found purple in ' + fp); hasBlue=true; }
    }
  });
  return hasBlue;
}
searchRec('Frontend/src/pages/Dashboard/SuperAdmin');
