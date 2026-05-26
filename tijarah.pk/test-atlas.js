import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function testAtlas() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI is not set in environment variables');
        process.exit(1);
    }

    // Extract username and host for logging
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log('Testing connection with URI:', maskedUri);

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ SUCCESS: Connected to MongoDB Atlas');

        const db = client.db();
        const result = await db.command({ ping: 1 });
        console.log('Ping result:', result);

        const dbs = await client.db('admin').admin().listDatabases();
        console.log('Available databases:', dbs.databases.map(db => db.name));

    } catch (error) {
        console.error('❌ FAILURE: Could not connect to MongoDB Atlas');
        console.error('Error Message:', error.message);
        console.log('\n--- DIAGNOSTICS ---');
        console.log('Username:', uri.split('://')[1]?.split(':')[0]);
        console.log('Host:', uri.split('@')[1]?.split('/')[0]);
        console.log('Database Name:', uri.split('/')[3]?.split('?')[0] || 'DEFAULT');
        console.log('-------------------\n');
    } finally {
        await client.close();
        process.exit(0);
    }
}

testAtlas().catch(console.error);
