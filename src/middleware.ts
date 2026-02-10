import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const loginAt = request.cookies.get('login_at')?.value;
    const { pathname } = request.nextUrl;

    // session timeout (8 hours)
    if (session && loginAt) {
        const eightHoursInMs = 8 * 60 * 60 * 1000;
        if (Date.now() - parseInt(loginAt) > eightHoursInMs) {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('session');
            response.cookies.delete('login_at');
            return response;
        }
    }

    // Redirect to login if no session cookie and trying to access protected route
    if (!session && pathname !== '/login' && !pathname.startsWith('/_next') && !pathname.includes('.')) {
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
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
