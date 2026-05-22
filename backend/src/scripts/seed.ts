import bcrypt from 'bcrypt';
import { Account, User, Client, ServiceProvider, ServiceCategory, Admin } from '../models';
import { connectDB, syncDB } from '../config';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Syncing database...');
    await syncDB();

    console.log('Seeding database...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Accounts
    await Account.bulkCreate([
      { email: 'client@example.com', password: hashedPassword, status: 'active' },
      { email: 'provider@example.com', password: hashedPassword, status: 'active' },
      { email: 'admin@example.com', password: hashedPassword, status: 'active' }
    ]);

    // 2. Create Users
    const users = await User.bulkCreate([
      { fname: 'John', lname: 'Client', email: 'client@example.com', phone_number: '123456789' },
      { fname: 'Jane', lname: 'Provider', email: 'provider@example.com', phone_number: '987654321' },
      { fname: 'Super', lname: 'Admin', email: 'admin@example.com', phone_number: '000000000' }
    ]);

    // 3. Assign Roles
    const clientUser = users.find(u => u.email === 'client@example.com');
    const providerUser = users.find(u => u.email === 'provider@example.com');
    const adminUser = users.find(u => u.email === 'admin@example.com');

    if (clientUser) {
      await Client.create({ idU_cl: clientUser.id });
    }

    if (providerUser) {
      await ServiceProvider.create({
        idU_SP: providerUser.id,
        bio: 'Professional caregiver',
        years_of_exp: 5,
        price_per_hour: 25.00
      });
    }

    if (adminUser) {
      await Admin.create({ idU_A: adminUser.id });
    }

    // 4. Create Categories
    await ServiceCategory.bulkCreate([
      { name: 'Medical', target_demographics: 'Elderly', icon: 'medical_icon' },
      { name: 'Childcare', target_demographics: 'Children', icon: 'child_icon' }
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
