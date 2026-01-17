const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');
const Product = require('./models/Product');

dotenv.config({ path: './config.env' });

const dbUrl = process.env.DB_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to the database for seeding...');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const names = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Ishaan', 'Krishna', 'Abhimanyu', 'Ananya', 'Diya', 'Ishani', 'Myra', 'Saanvi', 'Zoya', 'Advait', 'Atharv', 'Devanshu', 'Gaurav', 'Kabir', 'Ranvir'];
const specializationOptions = ['Traditional Art', 'Modern Architecture', 'Sculpture', 'Mural Painting', 'Pottery', 'Digital Art'];
const origins = ['Mysuru', 'Hampi', 'Bidar', 'Bengaluru', 'Vijayapura', 'Channapatna', 'Ilkal', 'Udupi', 'Belagavi', 'Mangaluru'];
const productTitles = ['Golden Temple Study', 'Monolithic Marvel', 'Sunset over Hampi', 'The Channapatna Toymaker', 'Ilkal Silk Patterns', 'Bidriware Vase', 'Modern Minimalist Villa', 'Ancient Pillars', 'Whispers of Dharwad', 'Ghats of Varanasi'];
const descriptions = [
    'A detailed study of traditional temple architecture.',
    'Capturing the grandeur of monolithic structures.',
    'An evocative piece reflecting history and heritage.',
    'Exploring the vibrant colors of local craftsmanship.',
    'Intricate patterns inspired by traditional weaving.',
    'A fusion of metalwork and artistic vision.',
    'Contemporary design meeting traditional aesthetics.',
    'Timeless beauty captured in stone.',
    'A narrative of culture and local stories.',
    'Dynamic perspective on ancient urban landscapes.'
];

const seedData = async () => {
    try {
        await connectDB();

        console.log('Starting data seeding...');

        const artists = [];
        const buyers = [];

        // Create 20 Users (10 Artists, 10 Buyers)
        for (let i = 0; i < 20; i++) {
            const role = i < 10 ? 'artist' : 'buyer';
            const name = names[i % names.length] + ' ' + (i + 1);
            const email = `user${i + 1}@example.com`;
            const password = 'password123'; // Will be hashed by pre-save hook

            const userData = {
                name,
                email,
                password,
                role,
                status: 'approved' // Set all to approved for easy testing
            };

            if (role === 'artist') {
                userData.specialization = specializationOptions[Math.floor(Math.random() * specializationOptions.length)];
                userData.bio = `Passionate ${userData.specialization} based in ${origins[Math.floor(Math.random() * origins.length)]}.`;
            }

            const user = await User.create(userData);
            if (role === 'artist') artists.push(user);
            else buyers.push(user);
        }

        console.log(`Successfully created 20 users (10 artists, 10 buyers).`);

        // Create 100 Products
        const productsToInsert = [];
        const mockPhotos = [
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80'
        ];

        for (let i = 0; i < 100; i++) {
            const artist = artists[Math.floor(Math.random() * artists.length)];
            const productData = {
                title: `${productTitles[i % productTitles.length]} #${i + 1}`,
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                photo: mockPhotos[Math.floor(Math.random() * mockPhotos.length)],
                price: Math.floor(Math.random() * 50000) + 1000,
                origin: origins[Math.floor(Math.random() * origins.length)],
                user: artist._id,
                tags: ['Art', 'History', 'Culture', specializationOptions[Math.floor(Math.random() * specializationOptions.length)]],
                isBiddable: Math.random() > 0.7,
                views: Math.floor(Math.random() * 500)
            };

            if (productData.isBiddable) {
                const now = new Date();
                productData.biddingEndTime = new Date(now.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000));
            }

            productsToInsert.push(productData);
        }

        await Product.insertMany(productsToInsert);
        console.log(`Successfully created 100 products.`);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
