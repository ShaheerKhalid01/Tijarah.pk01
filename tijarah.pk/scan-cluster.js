import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function scanCluster() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('--- CLUSTER SCAN ---');

        const admin = client.db('admin').admin();
        const dbs = await admin.listDatabases();

        for (const dbInfo of dbs.databases) {
            if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;

            console.log(`\nDB: ${dbInfo.name}`);
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();

            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(`  - ${col.name}: ${count} docs`);

                if (col.name === 'users' || col.name === 'User') {
                    const users = await db.collection(col.name).find({}).toArray();
                    users.forEach(u => console.log(`    FOUND USER: ${u.email || u.userName || 'No Email'}`));
                }
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
        process.exit(0);
    }
}

scanCluster();
