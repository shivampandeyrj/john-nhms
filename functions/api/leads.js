export async function onRequestGet({ request, env }) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const stmt = env.DB.prepare('SELECT * FROM leads ORDER BY timestamp DESC');
        const results = await stmt.all();

        return new Response(JSON.stringify(results.results), {
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

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { name, email, phone, magnet_type } = body;

        if (!name || !email || !magnet_type) {
            return new Response(JSON.stringify({ error: "Name, email, and magnet_type are required" }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const stmt = env.DB.prepare(`
            INSERT INTO leads (name, email, phone, magnet_type)
            VALUES (?, ?, ?, ?)
        `).bind(name, email, phone || null, magnet_type);
        
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
