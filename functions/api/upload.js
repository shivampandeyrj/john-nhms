export async function onRequestPost({ request, env }) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('admin_session=true')) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { fileName, fileData } = body;

        if (!fileName || !fileData) {
            return new Response(JSON.stringify({ error: "Missing file details" }), { status: 400 });
        }

        // Fetch Apps Script Configuration from Secrets
        const appsScriptUrl = env.APPS_SCRIPT_URL;
        const appsScriptSecret = env.APPS_SCRIPT_SECRET;

        if (!appsScriptUrl || !appsScriptSecret) {
            return new Response(JSON.stringify({ error: "Apps Script Secrets not configured in Cloudflare" }), { status: 500 });
        }

        const formData = new URLSearchParams();
        formData.append('action', 'upload');
        formData.append('secret', appsScriptSecret);
        formData.append('fileName', fileName);
        formData.append('fileData', fileData);

        const uploadRes = await fetch(appsScriptUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const uploadData = await uploadRes.json();
        return new Response(JSON.stringify(uploadData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: "Server Error", details: e.message }), { status: 500 });
    }
}
