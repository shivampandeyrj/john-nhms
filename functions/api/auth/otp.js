export async function onRequestPost({ request, env }) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { appsScriptUrl } = body;

        if (!appsScriptUrl) {
            return new Response(JSON.stringify({ error: "Apps Script URL is required to send the OTP" }), { status: 400 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        // Insert into DB
        const stmt = env.DB.prepare('INSERT INTO otp_codes (code, expires_at) VALUES (?, ?)').bind(otp, expiresAt);
        await stmt.run();

        // Call Apps Script to send email
        const formData = new URLSearchParams();
        formData.append('action', 'sendOtp');
        formData.append('otp', otp);

        const emailRes = await fetch(appsScriptUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // We assume it succeeds if it returns a response
        return new Response(JSON.stringify({ success: true, message: "OTP sent successfully" }), {
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
