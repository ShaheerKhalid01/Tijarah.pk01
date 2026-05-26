async function testLogin() {
    console.log('Starting NextAuth login test (ESM)...');
    const startTime = Date.now();

    try {
        const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'wrong@admin.pk',
                password: 'wrong_password',
                redirect: false
            })
        });

        const timeTaken = Date.now() - startTime;
        console.log(`Response received in ${timeTaken}ms with status: ${res.status}`);

        const text = await res.text();
        console.log('Response body:', text);

    } catch (err) {
        console.error('Fetch failed:', err);
    }
}

testLogin();
