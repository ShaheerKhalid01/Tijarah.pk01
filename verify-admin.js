import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function verify() {
    const uri = process.env.MONGODB_URI;
    console.log('Verifying admin in:', uri.split('@')[1]?.split('/')[0]);

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const user = await db.collection('users').findOne({ email: 'admin@tijarah.pk' });

        if (user) {
            console.log('✅ Found Admin User:');
            console.log('Email:', user.email);
            console.log('Role:', user.role);
            console.log('ID:', user._id);
        } else {
            console.log('❌ Admin user still not found in current database.');
        }
    } finally {
        await client.close();
        process.exit(0);
    }
}
verify();
