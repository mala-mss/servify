import { connectDB, syncDB } from '../config';

const runMigrations = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Syncing database models (creating tables)...');
    await syncDB();

    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
