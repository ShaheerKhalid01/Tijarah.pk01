import { connectToDatabase } from './lib/db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await connectToDatabase();
        const admin = await User.findOne({ email: 'admin@tijarah.pk' }).select('+password');
        if (!admin) {
            console.log('Admin user NOT found');
        } else {
            console.log('Admin user FOUND:', admin.email);
            console.log('Admin role:', admin.role);
            const isMatch = await bcrypt.compare('admin123', admin.password);
            console.log('Password "admin123" matches:', isMatch);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
