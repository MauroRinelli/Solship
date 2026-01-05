import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
    let connection;

    try {
        // Connect without database first to create it
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected to MySQL server');

        // Read and execute migration file
        const migrationSQL = readFileSync(join(__dirname, '001_create_tables.sql'), 'utf8');

        console.log('Running migrations...');
        await connection.query(migrationSQL);

        console.log('✓ Migrations completed successfully!');
        console.log('✓ Database "solship" created');
        console.log('✓ Tables created: users, destinations, shipments, settings');

    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

runMigrations();
