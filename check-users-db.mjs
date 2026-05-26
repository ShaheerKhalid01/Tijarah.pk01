import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
}

async function checkUsers() {
    try {
        console.log("Connecting to:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully");

        const users = await mongoose.connection.db.collection('users').find({}).toArray();

        console.log(`\nFound ${users.length} users:`);
        console.log("--------------------------------------------------");

        for (const user of users) {
            const isHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
            const passwordSample = user.password ? user.password.substring(0, 10) + "..." : "NONE";

            console.log(`Email: ${user.email}`);
            console.log(`Name:  ${user.name}`);
            console.log(`Role:  ${user.role}`);
            console.log(`Pass:  ${passwordSample}`);
            console.log(`Valid Hash: ${isHashed ? "✅ Yes" : "❌ No (PLAIN TEXT OR DOUBLE HASHED?)"}`);

            if (isHashed) {
                // Try a known password if provided in args
                const testPass = process.argv[2];
                if (testPass) {
                    const match = await bcrypt.compare(testPass, user.password);
                    console.log(`Match with "${testPass}": ${match ? "✅ SUCCESS" : "❌ FAIL"}`);
                }
            }
            console.log("--------------------------------------------------");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
