const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load env vars immediately
dotenv.config({ path: "./config.env" });

const User = require("./models/user.model");
const connectDatabase = require("./db");

const createAdmin = async () => {
    try {
        await connectDatabase();

        const adminUser = {
            name: "Admin User",
            email: "admin@archicanvas.com",
            password: "password123", // Change this!
            role: "admin",
            status: "approved",
            bio: "System Administrator"
        };

        const user = await User.findOne({ email: adminUser.email });

        if (user) {
            console.log("Admin user already exists!");
        } else {
            await User.create(adminUser);
            console.log("Admin user created successfully!");
        }

        process.exit();
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
