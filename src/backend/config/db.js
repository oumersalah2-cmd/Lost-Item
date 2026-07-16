const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '..', '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbName = process.env.NODE_ENV === 'test' ? 'campustrack_test.db' : 'campustrack.db';
const dbPath = path.join(dbDir, dbName);
const schemaPath = path.join(dbDir, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper to run queries as promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize database
const initDatabase = async () => {
  try {
    // 1. Read and run schema.sql
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Split SQL statements by semicolon and filter out empty ones
      // Since SQLite run() executes only the first statement, we must split and run them individually.
      const statements = schemaSql
        .split(/;\s*$/m) // split on semicolon at end of line
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // We run inside a transaction to ensure integrity
      db.serialize(() => {
        db.run('BEGIN TRANSACTION;');
        for (const statement of statements) {
          db.run(statement, (err) => {
            if (err && !err.message.includes('UNIQUE constraint failed')) {
              console.error('SQL Execution Error:', err.message, '\nStatement:', statement);
            }
          });
        }
        db.run('COMMIT;', async (err) => {
          if (err) {
            console.error('Failed to commit transaction:', err.message);
          } else {
            console.log('Database tables verified/created successfully.');
            await seedUsers();
          }
        });
      });
    } else {
      console.error('schema.sql not found at:', schemaPath);
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// Seed default users if users table is empty
const seedUsers = async () => {
  try {
    const userCount = await dbGet('SELECT COUNT(*) AS count FROM users');
    if (userCount.count === 0) {
      console.log('No users found in database. Seeding initial users...');

      const adminPassword = await bcrypt.hash('adminpassword', 10);
      const userPassword = await bcrypt.hash('password123', 10);

      // Insert Admin
      await dbRun(
        `INSERT INTO users (full_name, email, password, role, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Admin Moderator', 'admin@aau.edu.et', adminPassword, 'admin', 1]
      );

      // Insert Team PM (Abdusalam Oumer)
      await dbRun(
        `INSERT INTO users (full_name, email, password, role, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Abdusalam Oumer', 'abdusalam@aau.edu.et', userPassword, 'user', 1]
      );

      // Insert Frontend Developer (Abel Dereje)
      await dbRun(
        `INSERT INTO users (full_name, email, password, role, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Abel Dereje', 'abel@aau.edu.et', userPassword, 'user', 1]
      );

      console.log('Successfully seeded default users.');
      console.log('- Admin: admin@aau.edu.et / adminpassword');
      console.log('- User: abdusalam@aau.edu.et / password123');
      console.log('- User: abel@aau.edu.et / password123');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initDatabase
};
