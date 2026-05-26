import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function listUsers() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const users = await db.collection('users').find({}).toArray();

        console.log(`TOTAL USERS: ${users.length}`);
        users.forEach(u => {
            console.log(`- NAME: ${u.name} | EMAIL: ${u.email} | ROLE: ${u.role}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
        process.exit(0);
    }
}

listUsers();
