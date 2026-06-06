import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. dps.localhost:3000, localhost:3000)
  const hostname = req.headers.get('host') || '';
  
  // Define main domains that should NOT be treated as tenants
  const hostWithoutPort = hostname.split(':')[0];
  
  // Check if host is an IP address
  const isIpAddress = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/.test(hostWithoutPort);
  
  const isMainDomain =
    hostWithoutPort === 'localhost' ||
    hostWithoutPort === 'skoelx.com' ||
    hostWithoutPort === 'www.skoelx.com' ||
    isIpAddress;

  // Extract the subdomain if it exists
  const subdomain = isMainDomain ? null : hostname.split('.')[0];
  const { pathname } = req.nextUrl;

  // Protect ALL dashboard and tenant routes, even if subdomain is not detected properly in localhost testing
  const isTenantRoute = subdomain !== null || pathname.match(/^\/[a-zA-Z0-9-]+\/dashboard/) || pathname.startsWith('/dashboard');
  
  if (isTenantRoute) {
    // Public routes that do not require authentication
    const publicRoutes = ['/', '/login', '/register', '/api'];
    const isPublic = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
    
    // If testing on localhost without explicit subdomain, the pathname might be /sdsd/dashboard instead of /dashboard
    // So we need to consider if it's already an explicit tenant route path.
    if (isPublic && !pathname.match(/^\/[a-zA-Z0-9-]+\/(dashboard|login|register)/)) {
      return NextResponse.next();
    }

    const token = req.headers.get('authorization'); // Expect token in header for API routes
    const cookieToken = req.cookies.get('token');
    const hasToken = token || cookieToken?.value;
    
    if (!hasToken) {
      // Extract the tenant from either the subdomain or the first path segment
      const tenant = subdomain || pathname.split('/')[1];
      return NextResponse.rewrite(new URL(`/${tenant}/login`, req.url));
    }
    
    // If the request is for the root path, serve the public home page without auth
    if (pathname === '/' && subdomain) {
      // Serve the public home page for the subdomain (e.g., landing page)
      return NextResponse.next();
    }

    // Default tenant route goes to dashboard for authenticated users
    if (url.pathname === '/' && hasToken && subdomain) {
        return NextResponse.rewrite(new URL(`/${subdomain}/dashboard`, req.url));
    }

    // Pass everything else through to /[domain]/path
    if (subdomain) {
      return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
    } else {
      return NextResponse.next(); // Already has the explicit path like /sdsd/dashboard
    }
  }

  // If it's the main domain and not a tenant path, let it route normally
  return NextResponse.next();
}
