const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Community = require('./models/community.model');
const User = require('./models/user.model');

dotenv.config({ path: './config.env' });

const dbUrl = process.env.DB_URL;

const communitiesData = [
    {
        name: "Temple Architecture Enthusiasts",
        description: "A community for those who admire the intricate details and history of ancient temple architecture in India.",
        status: "approved"
    },
    {
        name: "Modern Minimalists",
        description: "Exploring clean lines and functional design in contemporary architecture.",
        status: "approved"
    },
    {
        name: "Sustainable Design Collective",
        description: "Focusing on eco-friendly building materials and green urban planning.",
        status: "approved"
    },
    {
        name: "Heritage Restoration Lab",
        description: "Dedicated to the preservation and restoration of historical monuments and buildings.",
        status: "approved"
    },
    {
        name: "Urban Sketchers Society",
        description: "A group for artists who love sketching cityscapes and architectural wonders on site.",
        status: "approved"
    },
    {
        name: "3D Rendering Masters",
        description: "Sharing tips and tricks for high-end architectural visualization and rendering.",
        status: "approved"
    }
];

const seedCommunities = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to database for community seeding...');

        // Get some artists to be creators
        const artists = await User.find({ role: 'artist' }).limit(5);

        if (artists.length === 0) {
            console.error('No artists found. Please run seedData.js first to create users.');
            process.exit(1);
        }

        // Clear existing communities to avoid duplicates if needed
        // await Community.deleteMany({});

        for (let i = 0; i < communitiesData.length; i++) {
            const creator = artists[i % artists.length];
            const communityData = {
                ...communitiesData[i],
                creator: creator._id,
                members: [creator._id],
                memberCount: 1
            };

            await Community.create(communityData);
            console.log(`Created community: ${communitiesData[i].name}`);
        }

        console.log('Community seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding communities:', error);
        process.exit(1);
    }
};

seedCommunities();
