export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
        return new Response(JSON.stringify({ error: "Missing key parameter" }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const stmt = env.DB.prepare('SELECT value FROM config WHERE key = ?').bind(key);
        const result = await stmt.first();

        if (result) {
            return new Response(JSON.stringify({ value: result.value }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ error: "Not found" }), { 
                status: 404,
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

export async function onRequestPost({ request, env }) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        const { key, value } = body;

        if (!key || !value) {
            return new Response(JSON.stringify({ error: "Missing key or value" }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const stmt = env.DB.prepare('INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(key, value);
        await stmt.run();

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
