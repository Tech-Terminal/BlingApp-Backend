const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('/Users/macbook/Development/Repos/bling/bling-backend/apps/public-api/src/modules/**/*.module.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Extract imports from @libs/index
  const barrelImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+'@libs\/index';/);
  
  if (barrelImportMatch) {
    const imports = barrelImportMatch[1].split(',').map(i => i.trim());
    let newImports = [];
    
    imports.forEach(imp => {
      // Very basic mapping for this specific issue
      let entityPath = '';
      if (imp === 'WarningGuide') entityPath = '@libs/database/src/entities/warning-guide.entity';
      else if (imp === 'ActiveIngredient') entityPath = '@libs/database/src/entities/active-ingredient.entity';
      else if (imp === 'ActiveIngredientInteraction') entityPath = '@libs/database/src/entities/active-ingredient-interaction.entity';
      else if (imp === 'Admin') entityPath = '@libs/database/src/entities/admin.entity';
      else if (imp === 'Company') entityPath = '@libs/database/src/entities/company.entity';
      else if (imp === 'ActiveIngredientCategory') entityPath = '@libs/database/src/entities/active-ingredient-category.entity';
      else if (imp === 'Role') entityPath = '@libs/database/src/entities/role.entity';
      else if (imp === 'Setting') entityPath = '@libs/database/src/entities/setting.entity';
      else if (imp === 'CompanyRequest') entityPath = '@libs/database/src/entities/company-request.entity';
      else if (imp === 'Medicine') entityPath = '@libs/database/src/entities/medicine.entity';
      else if (imp === 'Client') entityPath = '@libs/database/src/entities/client.entity';
      else {
         newImports.push(`import { ${imp} } from '@libs/index';`);
         return;
      }
      newImports.push(`import { ${imp} } from '${entityPath}';`);
    });
    
    content = content.replace(barrelImportMatch[0], newImports.join('\n'));
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
