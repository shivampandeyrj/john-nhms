export async function onRequestGet({ env }) {
    try {
        const stmt = env.DB.prepare('SELECT * FROM lead_magnets ORDER BY id DESC');
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
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { slug, header, info, bullet_points, profile_photo, title, button_text, mail_content } = body;

        if (!slug || !header) {
            return new Response(JSON.stringify({ error: "Slug and header are required" }), { status: 400 });
        }

        const stmt = env.DB.prepare(`
            INSERT INTO lead_magnets (slug, header, info, bullet_points, profile_photo, title, button_text, mail_content)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(slug, header, info, bullet_points, profile_photo, title, button_text, mail_content);
        
        const result = await stmt.run();

        return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
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
