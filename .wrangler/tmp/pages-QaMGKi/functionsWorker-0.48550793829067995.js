var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/auth/login.js
async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { otp } = body;
    if (!otp) {
      return new Response(JSON.stringify({ error: "Missing OTP" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const stmt = env.DB.prepare("SELECT * FROM otp_codes WHERE code = ? ORDER BY id DESC LIMIT 1").bind(otp);
    const otpRecord = await stmt.first();
    if (!otpRecord) {
      return new Response(JSON.stringify({ error: "Invalid OTP" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    if (now > expiresAt) {
      return new Response(JSON.stringify({ error: "OTP has expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare("DELETE FROM otp_codes WHERE code = ?").bind(otp).run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `admin_session=true; HttpOnly; Secure; Path=/; Max-Age=2592000; SameSite=Strict`
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");

// api/auth/logout.js
async function onRequestPost2() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `admin_session=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict`
    }
  });
}
__name(onRequestPost2, "onRequestPost");

// api/auth/otp.js
async function onRequestPost3({ request, env, waitUntil }) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const cacheUrl = new URL(request.url);
  cacheUrl.pathname = `/rate-limit-otp/${ip}`;
  const cacheKey = new Request(cacheUrl.toString());
  const cache = caches.default;
  let rateLimitResponse = await cache.match(cacheKey);
  if (rateLimitResponse) {
    return new Response(JSON.stringify({ error: "Too many OTP requests. Please wait 2 minutes." }), {
      status: 429,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const appsScriptUrl = env.APPS_SCRIPT_URL;
    const appsScriptSecret = env.APPS_SCRIPT_SECRET;
    if (!appsScriptUrl || !appsScriptSecret) {
      return new Response(JSON.stringify({ error: "Apps Script Secrets not configured in Cloudflare" }), { status: 500 });
    }
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
    const stmt = env.DB.prepare("INSERT INTO otp_codes (code, expires_at) VALUES (?, ?)").bind(otp, expiresAt);
    await stmt.run();
    const formData = new URLSearchParams();
    formData.append("action", "sendOtp");
    formData.append("secret", appsScriptSecret);
    formData.append("otp", otp);
    const emailRes = await fetch(appsScriptUrl, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    const newRateLimitRes = new Response("locked", {
      status: 200,
      headers: { "Cache-Control": "public, max-age=120" }
      // Lock for 2 mins
    });
    waitUntil(cache.put(cacheKey, newRateLimitRes));
    return new Response(JSON.stringify({ success: true, message: "OTP sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost3, "onRequestPost");

// api/leads/[id].js
async function onRequestDelete({ request, env, params }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("admin_session=true")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Lead ID is required" }), { status: 400 });
    }
    const stmt = env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(id);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete, "onRequestDelete");

// api/magnets/[id].js
async function onRequestDelete2({ request, env, params }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("admin_session=true")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const id = params.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID parameter" }), { status: 400 });
    }
    const stmt = env.DB.prepare("DELETE FROM lead_magnets WHERE id = ?").bind(id);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestDelete2, "onRequestDelete");
async function onRequestPut({ request, env, params }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("admin_session=true")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const id = params.id;
    if (!id) return new Response(JSON.stringify({ error: "Missing ID parameter" }), { status: 400 });
    const body = await request.json();
    const { slug, header, info, bullet_points, profile_photo, title, button_text, mail_content, pdf_url } = body;
    const stmt = env.DB.prepare(`
            UPDATE lead_magnets 
            SET slug = ?, header = ?, info = ?, bullet_points = ?, profile_photo = ?, title = ?, button_text = ?, mail_content = ?, pdf_url = ?
            WHERE id = ?
        `).bind(slug, header, info, bullet_points, profile_photo, title, button_text, mail_content, pdf_url || null, id);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPut, "onRequestPut");

// api/config.js
async function onRequestGet({ request, env, waitUntil }) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) {
    return new Response(JSON.stringify({ error: "Missing key parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const allowedPublicKeys = ["booking_url", "webinar_link"];
  const cookieHeader = request.headers.get("Cookie");
  const isAdmin = cookieHeader && cookieHeader.includes("admin_session=true");
  if (!allowedPublicKeys.includes(key) && !isAdmin) {
    return new Response(JSON.stringify({ error: "Unauthorized access to this config key" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;
  if (allowedPublicKeys.includes(key) && !isAdmin) {
    let cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  try {
    const stmt = env.DB.prepare("SELECT value FROM config WHERE key = ?").bind(key);
    const result = await stmt.first();
    if (result) {
      const response = new Response(JSON.stringify({ value: result.value }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
          // Cache for 5 mins
        }
      });
      if (allowedPublicKeys.includes(key) && !isAdmin) {
        waitUntil(cache.put(cacheKey, response.clone()));
      }
      return response;
    } else {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet, "onRequestGet");
async function onRequestPost4({ request, env }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("admin_session=true")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const body = await request.json();
    const { key, value } = body;
    if (!key || !value) {
      return new Response(JSON.stringify({ error: "Missing key or value" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const stmt = env.DB.prepare("INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, value);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost4, "onRequestPost");

// api/leads.js
async function onRequestGet2({ request, env }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("admin_session=true")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const stmt = env.DB.prepare("SELECT * FROM leads ORDER BY timestamp DESC");
    const results = await stmt.all();
    return new Response(JSON.stringify(results.results), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet2, "onRequestGet");
async function onRequestPost5({ request, env }) {
  try {
    const body = await request.json();
    const { name, email, phone, magnet_type } = body;
    if (!name || !email || !magnet_type) {
      return new Response(JSON.stringify({ error: "Name, email, and magnet_type are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const stmt = env.DB.prepare(`
            INSERT INTO leads (name, email, phone, magnet_type)
            VALUES (?, ?, ?, ?)
        `).bind(name, email, phone || null, magnet_type);
    await stmt.run();
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost5, "onRequestPost");

// api/magnets.js
async function onRequestGet3({ request, env }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("admin_session=true")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const stmt = env.DB.prepare("SELECT * FROM lead_magnets ORDER BY id DESC");
    const results = await stmt.all();
    return new Response(JSON.stringify(results.results), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet3, "onRequestGet");
async function onRequestPost6({ request, env }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("admin_session=true")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const body = await request.json();
    const { slug, header, info, bullet_points, profile_photo, title, button_text, mail_content, pdf_url } = body;
    if (!slug || !header) {
      return new Response(JSON.stringify({ error: "Slug and header are required" }), { status: 400 });
    }
    const stmt = env.DB.prepare(`
            INSERT INTO lead_magnets (slug, header, info, bullet_points, profile_photo, title, button_text, mail_content, pdf_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(slug, header, info, bullet_points, profile_photo, title, button_text, mail_content, pdf_url || null);
    const result = await stmt.run();
    return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost6, "onRequestPost");

// api/submit.js
async function onRequestPost7({ request, env }) {
  try {
    const body = await request.json();
    const { name, email, phone, magnetType } = body;
    if (!name || !email || !magnetType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }
    const stmt = env.DB.prepare(`
            INSERT INTO leads (name, email, phone, magnet_type)
            VALUES (?, ?, ?, ?)
        `).bind(name, email, phone || null, magnetType);
    await stmt.run();
    const magnetStmt = env.DB.prepare("SELECT * FROM lead_magnets WHERE slug = ?").bind(magnetType);
    const magnet = await magnetStmt.first();
    if (!magnet) {
      return new Response(JSON.stringify({ error: "Magnet not found" }), { status: 404 });
    }
    let rawMail = magnet.mail_content || `Hi ${name},

Here is your resource!`;
    let htmlMail = rawMail.replace(/\*(.*?)\*/g, '<span style="color: #0d9488; font-weight: 600;">$1</span>').replace(/\n/g, "<br>").replace(/\{name\}/g, name);
    let downloadButton = "";
    if (magnet.pdf_url) {
      downloadButton = `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${magnet.pdf_url}" style="background-color: #0d9488; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Download Your PDF</a>
                </div>
            `;
    }
    const reqUrl = new URL(request.url);
    const logoUrl = `${reqUrl.origin}/assets/logo.png`;
    const fullHtmlEmail = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; color: #333333; line-height: 1.6; margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto;">
                    
                    <div style="margin-bottom: 20px;">
                        <img src="${logoUrl}" alt="NHMS Logo" style="height: 40px; display: block;">
                    </div>
                    
                    <div style="font-size: 16px;">
                        ${htmlMail}
                        ${downloadButton}
                    </div>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888;">
                        <p>You received this email because you requested a resource from NHMS.</p>
                        <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} NHMS. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    const plainTextMail = rawMail.replace(/\*(.*?)\*/g, "$1") + (magnet.pdf_url ? `

Download link: ${magnet.pdf_url}` : "");
    const subject = `Your resource is here: ${magnet.title || magnet.header || magnetType}`;
    const appsScriptUrl = env.APPS_SCRIPT_URL;
    const appsScriptSecret = env.APPS_SCRIPT_SECRET;
    if (appsScriptUrl) {
      const formData = new URLSearchParams();
      formData.append("action", "sendLeadEmail");
      formData.append("secret", appsScriptSecret || "");
      formData.append("email", email);
      formData.append("name", name);
      formData.append("phone", phone || "");
      formData.append("magnetType", magnetType);
      formData.append("subject", subject);
      formData.append("plainText", plainTextMail);
      formData.append("htmlBody", fullHtmlEmail);
      await fetch(appsScriptUrl, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
    }
    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), { status: 500 });
  }
}
__name(onRequestPost7, "onRequestPost");

// api/upload.js
async function onRequestPost8({ request, env }) {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("admin_session=true")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const body = await request.json();
    const { fileName, fileData } = body;
    if (!fileName || !fileData) {
      return new Response(JSON.stringify({ error: "Missing file details" }), { status: 400 });
    }
    const appsScriptUrl = env.APPS_SCRIPT_URL;
    const appsScriptSecret = env.APPS_SCRIPT_SECRET;
    if (!appsScriptUrl || !appsScriptSecret) {
      return new Response(JSON.stringify({ error: "Apps Script Secrets not configured in Cloudflare" }), { status: 500 });
    }
    const formData = new URLSearchParams();
    formData.append("action", "upload");
    formData.append("secret", appsScriptSecret);
    formData.append("fileName", fileName);
    formData.append("fileData", fileData);
    const uploadRes = await fetch(appsScriptUrl, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    const uploadData = await uploadRes.json();
    return new Response(JSON.stringify(uploadData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server Error", details: e.message }), { status: 500 });
  }
}
__name(onRequestPost8, "onRequestPost");

// admin/_middleware.js
async function onRequest(context) {
  const { request, next } = context;
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader && cookieHeader.includes("admin_session=true")) {
    return next();
  }
  const url = new URL(request.url);
  url.pathname = "/admin-login.html";
  return Response.redirect(url.toString(), 302);
}
__name(onRequest, "onRequest");

// [[slug]].js
async function onRequestGet4({ request, env, next, params, waitUntil }) {
  const slugParams = params.slug;
  const slug = Array.isArray(slugParams) ? slugParams.join("/") : slugParams;
  if (!slug || slug === "" || ["css", "js", "assets", "api", "admin", "call"].includes(slug.split("/")[0])) {
    return next();
  }
  const cacheUrl = new URL(request.url);
  const cacheKey = new Request(cacheUrl.toString(), request);
  const cache = caches.default;
  let cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const stmt = env.DB.prepare("SELECT * FROM lead_magnets WHERE slug = ?").bind(slug);
    const data = await stmt.first();
    if (!data) {
      return next();
    }
    const templateUrl = new URL("/_magnet_template.html", request.url);
    const templateRes = await env.ASSETS.fetch(new Request(templateUrl));
    if (!templateRes.ok) {
      return next();
    }
    class ElementHandler {
      static {
        __name(this, "ElementHandler");
      }
      constructor(content, type = "text") {
        this.content = content;
        this.type = type;
      }
      element(el) {
        if (!this.content) return;
        if (this.type === "attr" && el.tagName === "input") {
          el.setAttribute("value", this.content);
        } else if (this.type === "src" && el.tagName === "img") {
          el.setAttribute("src", this.content);
        } else if (this.type === "list") {
          const bullets = this.content.split("\n").filter((b) => b.trim() !== "");
          const html = bullets.map((b) => `<li style="margin-bottom: 1rem;">${b.trim()}</li>`).join("");
          el.setInnerContent(html, { html: true });
        } else {
          el.setInnerContent(this.content, { html: true });
        }
      }
    }
    const rewriter = new HTMLRewriter().on("#dyn-header", new ElementHandler(data.header)).on("#dyn-title", new ElementHandler(data.title)).on("#dyn-info", new ElementHandler(data.info)).on("#dyn-bullets", new ElementHandler(data.bullet_points, "list")).on("#dyn-slug", new ElementHandler(data.slug, "attr")).on("#dyn-btn", new ElementHandler(data.button_text));
    if (data.profile_photo) {
      rewriter.on("#dyn-photo", new ElementHandler(data.profile_photo, "src"));
    }
    const modifiedRes = rewriter.transform(templateRes);
    const newHeaders = new Headers(modifiedRes.headers);
    newHeaders.set("Content-Type", "text/html;charset=UTF-8");
    newHeaders.set("Cache-Control", "public, max-age=300");
    const response = new Response(modifiedRes.body, {
      status: 200,
      headers: newHeaders
    });
    waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch (e) {
    console.error("HTMLRewriter Error", e);
    return next();
  }
}
__name(onRequestGet4, "onRequestGet");

// ../.wrangler/tmp/pages-QaMGKi/functionsRoutes-0.20449375129345393.mjs
var routes = [
  {
    routePath: "/api/auth/login",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/auth/logout",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/auth/otp",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/leads/:id",
    mountPath: "/api/leads",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/magnets/:id",
    mountPath: "/api/magnets",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete2]
  },
  {
    routePath: "/api/magnets/:id",
    mountPath: "/api/magnets",
    method: "PUT",
    middlewares: [],
    modules: [onRequestPut]
  },
  {
    routePath: "/api/config",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/config",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/leads",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/leads",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/magnets",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/magnets",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/submit",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost8]
  },
  {
    routePath: "/admin",
    mountPath: "/admin",
    method: "",
    middlewares: [onRequest],
    modules: []
  },
  {
    routePath: "/:slug*",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  }
];

// ../../../.npm/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
