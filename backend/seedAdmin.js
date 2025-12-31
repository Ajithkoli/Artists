// Script to seed an initial admin user
// Usage: node seedAdmin.js
// Loads environment variables from config.env (same as server.js)

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/user.model');

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error('DB_URL is not set in config.env');
  process.exit(1);
}

const adminName = process.env.ADMIN_NAME || 'Super Admin';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD; // must be set

if (!adminPassword) {
  console.error('ADMIN_PASSWORD is not set in config.env');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      if (existing.role !== 'admin') {
        console.log(`User with email ${adminEmail} exists but is role=${existing.role}. Not modifying.`);
      } else {
        console.log('Admin user already exists. Nothing to do.');
      }
      return;
    }

    const adminUser = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin'
    });

    console.log('Admin user created:', { id: adminUser._id.toString(), email: adminUser.email });
  } catch (err) {
    console.error('Error seeding admin user:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
