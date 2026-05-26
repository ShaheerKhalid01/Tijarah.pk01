async function run() {
    console.log('1. Fetching CSRF token...');
    let csrfToken = '';
    const cookies = [];

    try {
        const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
        const csrfData = await csrfRes.json();
        csrfToken = csrfData.csrfToken;
        console.log('CSRF Token:', csrfToken);

        // Extract cookies
        const setCookieHeader = csrfRes.headers.get('set-cookie');
        if (setCookieHeader) {
            cookies.push(setCookieHeader.split(';')[0]);
        }
    } catch (err) {
        console.error('Failed to get CSRF token:', err.message);
        return;
    }

    console.log('2. Sending POST request to credentials callback...');
    const startTime = Date.now();
    try {
        const body = new URLSearchParams();
        body.append('email', 'wrong@admin.pk');
        body.append('password', 'wrongpassword');
        body.append('csrfToken', csrfToken);
        body.append('json', 'true');

        const res = await fetch('http://localhost:3000/api/auth/callback/credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookies.join('; ')
            },
            body: body.toString()
        });

        const timeTaken = Date.now() - startTime;
        console.log(`Response received in ${timeTaken}ms with status: ${res.status}`);

        const resUrl = res.url;
        console.log('Redirect URL (if any):', resUrl);

        try {
            const data = await res.json();
            console.log('Response JSON:', data);
        } catch {
            const text = await res.text();
            console.log('Response body (not JSON):', text.substring(0, 500) + '...');
        }

    } catch (err) {
        console.error('Login POST failed:', err.message);
    }
}

run();
