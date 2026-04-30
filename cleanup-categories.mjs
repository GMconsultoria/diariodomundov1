import mysql from 'mysql2/promise';

// Parse DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: {},
});

try {
  // Delete all posts with old categories
  console.log('Deleting posts with old categories...');
  await connection.execute('DELETE FROM posts WHERE category NOT IN ("Política", "Economia", "Investimentos", "Ciência e Tecnologia", "Curiosidade")');
  
  // Apply the migration
  console.log('Applying migration...');
  await connection.execute("ALTER TABLE `posts` MODIFY COLUMN `category` enum('Política','Economia','Investimentos','Ciência e Tecnologia','Curiosidade') NOT NULL");
  
  console.log('✓ Migration completed successfully!');
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await connection.end();
}
