export async function onRequestDelete({ request, env, params }) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const id = params.id;
        
        if (!id) {
            return new Response(JSON.stringify({ error: "Lead ID is required" }), { status: 400 });
        }

        const stmt = env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id);
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
