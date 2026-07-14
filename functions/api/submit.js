export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { name, email, phone, magnetType } = body;

        if (!name || !email || !magnetType) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // 1. Save Lead to D1
        const stmt = env.DB.prepare(`
            INSERT INTO leads (name, email, phone, magnet_type)
            VALUES (?, ?, ?, ?)
        `).bind(name, email, phone || null, magnetType);
        await stmt.run();

        // 2. Fetch Lead Magnet Details
        const magnetStmt = env.DB.prepare('SELECT * FROM lead_magnets WHERE slug = ?').bind(magnetType);
        const magnet = await magnetStmt.first();

        if (!magnet) {
            return new Response(JSON.stringify({ error: "Magnet not found" }), { status: 404 });
        }

        // 3. Format Email
        let rawMail = magnet.mail_content || `Hi ${name},\n\nHere is your resource!`;
        let htmlMail = rawMail
            .replace(/\*(.*?)\*/g, '<span style="color: #0d9488; font-weight: 600;">$1</span>')
            .replace(/\n/g, '<br>')
            .replace(/\{name\}/g, name);

        let downloadButton = '';
        if (magnet.pdf_url) {
            downloadButton = `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${magnet.pdf_url}" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Download Your PDF</a>
                </div>
            `;
        }

        const fullHtmlEmail = `
            <!DOCTYPE html>
            <html>
            <body style="margin: 0; padding: 40px 20px; background-color: #ffffff; background-image: linear-gradient(135deg, #ffffff 40%, rgba(71, 138, 154, 0.08) 100%); font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F0D0E; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #E0E0E0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    
                    <!-- Blue Strip / Accent -->
                    <div style="height: 8px; background-color: #478A9A; width: 100%;"></div>
                    
                    <div style="padding: 40px;">
                        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #E0E0E0; padding-bottom: 20px;">
                            <img src="https://cdn.pixabay.com/photo/2017/02/18/19/20/logo-2078018_1280.png" alt="NHMS Logo" style="height: 50px;">
                        </div>
                        
                        <div style="font-size: 16px; color: #4A4A4A;">
                            ${htmlMail}
                            ${downloadButton}
                        </div>
                    </div>
                    
                    <div style="background-color: rgba(71, 138, 154, 0.03); padding: 20px 40px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #E0E0E0;">
                        <p style="margin: 0;">You received this email because you requested a resource from NHMS.</p>
                        <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} NHMS. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const plainTextMail = rawMail.replace(/\*(.*?)\*/g, '$1') + (magnet.pdf_url ? `\n\nDownload link: ${magnet.pdf_url}` : '');
        const subject = `Your resource is here: ${magnet.title || magnet.header || magnetType}`;

        // 4. Fetch Apps Script Configuration from Secrets
        const appsScriptUrl = env.APPS_SCRIPT_URL;
        const appsScriptSecret = env.APPS_SCRIPT_SECRET;

        if (appsScriptUrl) {
            const formData = new URLSearchParams();
            formData.append('action', 'sendLeadEmail');
            formData.append('secret', appsScriptSecret || '');
            formData.append('email', email);
            formData.append('name', name);
            formData.append('phone', phone || '');
            formData.append('magnetType', magnetType);
            formData.append('subject', subject);
            formData.append('plainText', plainTextMail);
            formData.append('htmlBody', fullHtmlEmail);

            // 5. Trigger Secure Apps Script
            await fetch(appsScriptUrl, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        }

        return new Response(JSON.stringify({ status: "success" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: "Server Error", details: e.message }), { status: 500 });
    }
}
