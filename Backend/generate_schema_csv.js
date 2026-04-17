const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// We run this script from inside Backend so mongoose is available
const modelsDir = path.join(__dirname, 'src', 'models');

// Load all mongoose models
fs.readdirSync(modelsDir).forEach(file => {
  if (file.endsWith('.mongoose.js')) {
    try {
      require(path.join(modelsDir, file));
    } catch (e) {
      console.error(`Error loading model ${file}: ${e.message}`);
    }
  }
});

let csv = "";
let txt = "";

mongoose.modelNames().forEach(modelName => {
  const model = mongoose.model(modelName);
  const schema = model.schema;
  
  csv += `TABLE: ${modelName}\n`;
  csv += `Field Name,Data Type,PK/FK,Description\n`;
  csv += `_id,ObjectId,PK,Unique identifier for each ${modelName}.\n`;
  
  txt += `========== TABLE: ${modelName} ==========\n`;
  txt += `Field Name                | Data Type       | PK/FK  | Description\n`;
  txt += `----------------------------------------------------------------------------------------------------\n`;
  txt += `_id                       | ObjectId        | PK     | Unique identifier for each ${modelName}.\n`;
  
  Object.keys(schema.paths).forEach(pathName => {
    if (pathName === '_id' || pathName === '__v') return;
    
    const pathObj = schema.paths[pathName];
    
    let type = pathObj.instance || "Mixed";
    if (type === "Array" && pathObj.caster && pathObj.caster.instance) {
       type = `Array of ${pathObj.caster.instance}`;
    }
    
    let isFk = "";
    let descParts = [];
    
    if (pathObj.options && pathObj.options.ref) {
      isFk = "FK";
      descParts.push(`Reference to ${pathObj.options.ref}s._id.`);
    }
    
    if (pathObj.enumValues && pathObj.enumValues.length > 0) {
      descParts.push(`Allowed values: [${pathObj.enumValues.join('; ')}].`);
    }
    
    if (pathObj.options && pathObj.options.required) {
      descParts.push(`Required field.`);
    }
    
    if (pathObj.options && pathObj.options.default !== undefined) {
      if (typeof pathObj.options.default === 'string' || typeof pathObj.options.default === 'number' || typeof pathObj.options.default === 'boolean') {
        descParts.push(`Default: ${pathObj.options.default}.`);
      }
    }
    
    if (descParts.length === 0) {
        let cleanName = pathName.split('.').pop()
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        descParts.push(`${cleanName} field for ${modelName}.`);
    }

    let finalDesc = descParts.join(' ').replace(/"/g, '""');
    
    csv += `"${pathName}","${type}","${isFk}","${finalDesc}"\n`;
    txt += `${pathName.padEnd(25)} | ${type.padEnd(15)} | ${isFk.padEnd(6)} | ${finalDesc}\n`;
  });
  
  csv += "\n";
  txt += "\n\n";
});

// Using a new name because the user likely has the old CSV open in Excel locking the file
const outCsv = path.join(__dirname, '..', 'EduVerse_Tables_Full.csv');
const outTxt = path.join(__dirname, '..', 'EduVerse_Tables_Full.txt');

fs.writeFileSync(outCsv, csv);
fs.writeFileSync(outTxt, txt);

console.log("Generated robust CSV and TXT tables successfully using Mongoose runtime.");
