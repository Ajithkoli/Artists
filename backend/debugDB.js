const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, 'config.env');
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });

console.log('DB_URL from env:', process.env.DB_URL ? 'FOUND (omitted for security)' : 'NOT FOUND');

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl).then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Host:', mongoose.connection.host);
    console.log('Database Name:', mongoose.connection.name);
    process.exit(0);
}).catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
});
