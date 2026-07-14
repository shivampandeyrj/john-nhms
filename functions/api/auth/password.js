export async function onRequestPost({ request, env }) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { otp, newPassword } = body;

        if (!otp || !newPassword) {
            return new Response(JSON.stringify({ error: "OTP and new password are required" }), { status: 400 });
        }

        // Verify OTP
        const stmt = env.DB.prepare('SELECT id FROM otp_codes WHERE code = ? AND expires_at > datetime("now") ORDER BY id DESC LIMIT 1').bind(otp);
        const validOtp = await stmt.first();

        if (!validOtp) {
            return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), { status: 400 });
        }

        // Delete used OTP
        await env.DB.prepare('DELETE FROM otp_codes WHERE id = ?').bind(validOtp.id).run();

        // Hash the new password using Web Crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(newPassword);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Update admin password (MVP: username 'admin')
        const updateStmt = env.DB.prepare('UPDATE admin SET password_hash = ? WHERE username = "admin"').bind(hashedPassword);
        await updateStmt.run();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Server Error", details: e.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
