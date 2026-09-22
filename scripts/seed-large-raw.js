const { Client } = require('pg');

async function seed() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });
  await client.connect();

  console.log('Clearing existing data...');
  await client.query('TRUNCATE TABLE "medicines" CASCADE;');
  await client.query('TRUNCATE TABLE "active_ingredients" CASCADE;');
  await client.query('TRUNCATE TABLE "active_ingredient_categories" CASCADE;');
  await client.query('TRUNCATE TABLE "companies" CASCADE;');

  console.log('Inserting mock category...');
  const catRes = await client.query('INSERT INTO "active_ingredient_categories" ("nameEn", "nameAr", "isActive") VALUES ($1, $2, $3) RETURNING id', ['Mock Category', 'صنف تجريبي', true]);
  const catId = catRes.rows[0].id;

  console.log('Inserting mock company...');
  const compRes = await client.query('INSERT INTO "companies" ("nameEn", "nameAr", "isActive") VALUES ($1, $2, $3) RETURNING id', ['Mock Company', 'شركة تجريبية', true]);
  const compId = compRes.rows[0].id;

  console.log('Generating 20k Active Ingredients...');
  let aiValues = [];
  for (let i = 1; i <= 20000; i++) {
    // prescriptionType OTC = 1, dangerLevel NORMAL = 1
    aiValues.push(`('Active Ingredient ${i}', 'مادة فعالة ${i}', ${catId}, 1, 1, true, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb)`);
    
    // Batch insert every 5000 to avoid query string length limits
    if (i % 5000 === 0) {
      await client.query(`INSERT INTO "active_ingredients" ("nameEn", "nameAr", "categoryId", "prescriptionType", "dangerLevel", "isActive", "indications", "structuredDosages", "usageInstructions", "usageMethods", "warnings", "contraindications", "veryCommonSideEffects", "commonSideEffects", "uncommonSideEffects", "toxicitySymptoms") VALUES ${aiValues.join(',')}`);
      aiValues = [];
      console.log(`Inserted ${i} active ingredients...`);
    }
  }

  console.log('Getting all active ingredient IDs...');
  const allAis = await client.query('SELECT id, "nameEn", "nameAr" FROM "active_ingredients"');
  
  console.log('Generating 20k Medicines...');
  let medValues = [];
  for (let i = 1; i <= 20000; i++) {
    const ai = allAis.rows[i - 1]; // one-to-one mock mapping
    medValues.push(`('Medicine ${i}', 'دواء ${i}', ${ai.id}, ${compId}, '500mg', 1, 1, true)`);
    
    if (i % 5000 === 0) {
      await client.query(`INSERT INTO "medicines" ("nameEn", "nameAr", "activeIngredientId", "companyId", "concentration", "pharmaceuticalForm", "origin", "status") VALUES ${medValues.join(',')}`);
      medValues = [];
      console.log(`Inserted ${i} medicines...`);
    }
  }
  
  await client.end();
  console.log('Database seeding completed successfully! We can now run the sync-direct.js script to push to Meilisearch.');
}

seed().catch(console.error);
