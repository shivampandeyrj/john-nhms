export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { otp } = body;

        if (!otp) {
            return new Response(JSON.stringify({ error: "Missing OTP" }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check DB for the OTP
        const stmt = env.DB.prepare('SELECT * FROM otp_codes WHERE code = ? ORDER BY id DESC LIMIT 1').bind(otp);
        const otpRecord = await stmt.first();

        if (!otpRecord) {
            return new Response(JSON.stringify({ error: "Invalid OTP" }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check expiration
        const now = new Date();
        const expiresAt = new Date(otpRecord.expires_at);

        if (now > expiresAt) {
            return new Response(JSON.stringify({ error: "OTP has expired" }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // OTP is valid. Delete it so it cannot be reused
        await env.DB.prepare('DELETE FROM otp_codes WHERE code = ?').bind(otp).run();

        // Set secure cookie valid for 30 days
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': `admin_session=true; HttpOnly; Secure; Path=/; Max-Age=2592000; SameSite=Strict`
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Server Error", details: e.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
