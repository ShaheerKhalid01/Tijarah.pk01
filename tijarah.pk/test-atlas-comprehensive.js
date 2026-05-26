import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function test(uri, label) {
    console.log(`\n--- Testing ${label} ---`);
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log(`✅ SUCCESS: ${label} connected!`);
        await client.close();
        return true;
    } catch (e) {
        console.log(`❌ FAILURE: ${label} - ${e.message}`);
        return false;
    }
}

async function runTests() {
    const base = "mongodb+srv://wwwshaheerkhalid88600_db_user:";
    const suffix = "@cluster0.c8mbgea.mongodb.net/tijarah?appName=Cluster0";

    // Test 1: Percent-encoded (assuming Atlas password is #Shaheer12)
    await test(`${base}%23Shaheer12${suffix}`, "Hash (#)");

    // Test 2: Double-encoded (assuming Atlas password is literal %23Shaheer12)
    await test(`${base}%2523Shaheer12${suffix}`, "Literal (%23)");

    // Test 3: Raw (assuming Atlas password has no special characters)
    await test(`${base}Shaheer12${suffix}`, "No Special Char");

    process.exit(0);
}

runTests();
