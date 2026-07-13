export async function onRequest(context) {
    const { request, next } = context;
    
    const cookieHeader = request.headers.get('Cookie');
    
    // Check if the admin_session cookie exists
    if (cookieHeader && cookieHeader.includes('admin_session=true')) {
        // Authenticated, allow access to admin.html
        return next();
    }
    
    // Not authenticated, redirect to login page
    const url = new URL(request.url);
    url.pathname = '/admin-login.html';
    
    return Response.redirect(url.toString(), 302);
}
