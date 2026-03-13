import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const loginAt = request.cookies.get('login_at')?.value;
    const { pathname } = request.nextUrl;

    // Session timeout (8 hours)
    if (session && loginAt) {
        const loginTimestamp = parseInt(loginAt, 10);
        if (!isNaN(loginTimestamp)) {
            const eightHoursInMs = 8 * 60 * 60 * 1000;
            if (Date.now() - loginTimestamp > eightHoursInMs) {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('session');
                response.cookies.delete('login_at');
                return response;
            }
        }
    }

    // Redirect to login if no session cookie and trying to access protected route
    if (!session && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to home if session cookie exists and trying to access login
    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, robots.txt, sitemap.xml
         * - Public files with extensions (.png, .jpg, .svg, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)',
    ],
};
