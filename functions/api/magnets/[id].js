export async function onRequestDelete({ request, env, params }) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const id = params.id;

        if (!id) {
            return new Response(JSON.stringify({ error: "Missing ID parameter" }), { status: 400 });
        }

        const stmt = env.DB.prepare('DELETE FROM lead_magnets WHERE id = ?').bind(id);
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

export async function onRequestPut({ request, env, params }) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const id = params.id;
        if (!id) return new Response(JSON.stringify({ error: "Missing ID parameter" }), { status: 400 });

        const body = await request.json();
        const { slug, header, info, bullet_points, profile_photo, title, button_text, email_button_text, mail_content, pdf_url } = body;

        const stmt = env.DB.prepare(`
            UPDATE lead_magnets 
            SET slug = ?, header = ?, info = ?, bullet_points = ?, profile_photo = ?, title = ?, button_text = ?, email_button_text = ?, mail_content = ?, pdf_url = ?
            WHERE id = ?
        `).bind(slug, header, info, bullet_points, profile_photo, title, button_text, email_button_text, mail_content, pdf_url || null, id);
        
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
