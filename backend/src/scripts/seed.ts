import bcrypt from 'bcrypt';
import { User, Service } from '../models';
import { connectDB, syncDB } from '../config';
import { bcryptRounds } from '../config/auth.config';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Syncing database...');
    await syncDB();

    console.log('Seeding database with sample data...');

    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('⚠️  Database already has users. Skipping seed.');
      process.exit(0);
    }

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', bcryptRounds);

    const users = await User.bulkCreate([
      {
        name: 'Test Client',
        email: 'client@example.com',
        password: hashedPassword,
        role: 'client',
        phone: '+213555123456',
        isActive: true,
        isVerified: true,
      },
      {
        name: 'Test Provider',
        email: 'provider@example.com',
        password: hashedPassword,
        role: 'provider',
        phone: '+213555789012',
        bio: 'Experienced caregiver with 5 years of experience',
        isActive: true,
        isVerified: true,
        rating: 4.8,
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+213555000000',
        isActive: true,
        isVerified: true,
      },
    ]);

    const provider = users.find(u => u.role === 'provider');
    if (!provider) {
      throw new Error('Provider not found after creation');
    }

    console.log('✅ Created sample users:');
    console.log('   - Client: client@example.com / password123');
    console.log('   - Provider: provider@example.com / password123');
    console.log('   - Admin: admin@example.com / password123');

    // Create sample services
    await Service.bulkCreate([
      {
        providerId: provider.id,
        name: 'Elderly Care',
        description: 'Professional medical and personal support for seniors.',
        price: 2500,
        unit: 'hour',
        category: 'Medical',
        isActive: true,
      },
      {
        providerId: provider.id,
        name: 'Babysitting',
        description: 'Experienced child care and educational activities.',
        price: 1800,
        unit: 'hour',
        category: 'Childcare',
        isActive: true,
      },
      {
        providerId: provider.id,
        name: 'Home Cleaning',
        description: 'Deep cleaning and organization for residential spaces.',
        price: 1200,
        unit: 'hour',
        category: 'Housework',
        isActive: true,
      },
    ]);

    console.log('✅ Created sample services');
    console.log('✅ Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
