export async function onRequestGet({ request, env, next, params }) {
    const slugParams = params.slug;
    const slug = Array.isArray(slugParams) ? slugParams.join('/') : slugParams;

    // Fast return for static assets or known routes
    if (!slug || slug === '' || 
        ['css', 'js', 'assets', 'api', 'admin', 'call'].includes(slug.split('/')[0])) {
        return next();
    }

    try {
        const stmt = env.DB.prepare('SELECT * FROM lead_magnets WHERE slug = ?').bind(slug);
        const data = await stmt.first();

        // If no lead magnet found for this slug, fallback to normal static asset serving
        if (!data) {
            return next();
        }

        // Fetch the master template
        const templateUrl = new URL('/_magnet_template.html', request.url);
        const templateRes = await env.ASSETS.fetch(new Request(templateUrl));

        if (!templateRes.ok) {
            // Template not found
            return next();
        }

        // Inject dynamic data into the template
        class ElementHandler {
            constructor(content, type = 'text') {
                this.content = content;
                this.type = type; // text, list, attr
            }
            element(el) {
                if (!this.content) return;
                
                if (this.type === 'attr' && el.tagName === 'input') {
                    el.setAttribute('value', this.content);
                } else if (this.type === 'src' && el.tagName === 'img') {
                    el.setAttribute('src', this.content);
                } else if (this.type === 'list') {
                    const bullets = this.content.split('\n').filter(b => b.trim() !== '');
                    const html = bullets.map(b => `<li style="margin-bottom: 1rem;">${b.trim()}</li>`).join('');
                    el.setInnerContent(html, { html: true });
                } else {
                    el.setInnerContent(this.content, { html: true });
                }
            }
        }

        const rewriter = new HTMLRewriter()
            .on('#dyn-header', new ElementHandler(data.header))
            .on('#dyn-title', new ElementHandler(data.title))
            .on('#dyn-info', new ElementHandler(data.info))
            .on('#dyn-bullets', new ElementHandler(data.bullet_points, 'list'))
            .on('#dyn-slug', new ElementHandler(data.slug, 'attr'))
            .on('#dyn-btn', new ElementHandler(data.button_text));
            
        if (data.profile_photo) {
            rewriter.on('#dyn-photo', new ElementHandler(data.profile_photo, 'src'));
        }

        const modifiedRes = rewriter.transform(templateRes);
        
        // Ensure proper content type
        const newHeaders = new Headers(modifiedRes.headers);
        newHeaders.set('Content-Type', 'text/html;charset=UTF-8');
        
        return new Response(modifiedRes.body, {
            status: 200,
            headers: newHeaders
        });

    } catch (e) {
        // Fallback to static serving on error
        console.error("HTMLRewriter Error", e);
        return next();
    }
}
