export async function onRequestPost({ request, env, waitUntil }) {
    // 1. IP Rate Limiting (Max 1 OTP every 2 mins per IP)
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const cacheUrl = new URL(request.url);
    cacheUrl.pathname = `/rate-limit-otp/${ip}`;
    const cacheKey = new Request(cacheUrl.toString());
    const cache = caches.default;
    
    let rateLimitResponse = await cache.match(cacheKey);
    if (rateLimitResponse) {
        return new Response(JSON.stringify({ error: "Too many OTP requests. Please wait 2 minutes." }), { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Fetch Apps Script Configuration from Environment Variables (Secrets)
        const appsScriptUrl = env.APPS_SCRIPT_URL;
        const appsScriptSecret = env.APPS_SCRIPT_SECRET;

        if (!appsScriptUrl || !appsScriptSecret) {
            return new Response(JSON.stringify({ error: "Apps Script Secrets not configured in Cloudflare" }), { status: 500 });
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
        formData.append('secret', appsScriptSecret);
        formData.append('otp', otp);

        const emailRes = await fetch(appsScriptUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Add IP to cache to prevent spam
        const newRateLimitRes = new Response("locked", {
            status: 200,
            headers: { 'Cache-Control': 'public, max-age=120' } // Lock for 2 mins
        });
        waitUntil(cache.put(cacheKey, newRateLimitRes));

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
