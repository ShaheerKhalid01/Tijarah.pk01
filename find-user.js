import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function findUser() {
    const uri = process.env.MONGODB_URI;
    const emailToFind = "www.shaheerkhalid88600@gmail.com";

    console.log('Connecting to Atlas...');
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        console.log('Connected to database:', db.databaseName);

        const usersCollection = db.collection('users');

        // 1. Exact match
        const exactMatch = await usersCollection.findOne({ email: emailToFind });
        if (exactMatch) {
            console.log('✅ Found exact match:', JSON.stringify(exactMatch, null, 2));
        } else {
            console.log('❌ No exact match for:', emailToFind);
        }

        // 2. Case-insensitive search (just in case)
        const caseInsensitiveMatch = await usersCollection.findOne({
            email: { $regex: new RegExp(`^${emailToFind.replace('.', '\\.')}$`, 'i') }
        });
        if (caseInsensitiveMatch && !exactMatch) {
            console.log('⚠️ Found case-insensitive match:', caseInsensitiveMatch.email);
        }

        // 3. List some users to see what's in there
        const someUsers = await usersCollection.find({}).limit(5).toArray();
        console.log('\nSample emails in database:');
        someUsers.forEach(u => console.log(`- ${u.email}`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
        process.exit(0);
    }
}

findUser();
