export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return new Response(JSON.stringify({ error: "Missing credentials" }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Query D1 database for the admin user
        const stmt = env.DB.prepare('SELECT password_hash FROM admin WHERE username = ?').bind(username);
        const user = await stmt.first();

        // Hash the provided password using Web Crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (user && user.password_hash === hashedPassword) {
            // Set secure cookie valid for 24 hours
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `admin_session=true; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Strict`
                }
            });
        } else {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: "Server Error", details: e.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
