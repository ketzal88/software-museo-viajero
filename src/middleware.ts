import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas del sitio público — NO requieren sesión.
const PUBLIC_PATHS: Array<string | RegExp> = [
    "/",
    "/cartelera",
    "/repertorio",
    "/nosotros",
    "/contacto",
    "/ingresar",
    "/publicaciones",
    "/prensa",
    "/materiales",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
    /^\/repertorio\/.+/,
    /^\/cartelera\/.+/,
    /^\/publicaciones\/.+/,
    /^\/prensa\/.+/,
    /^\/materiales\/.+/,
];

// Rutas que requieren user público autenticado (no staff).
const PUBLIC_AUTH_REQUIRED: Array<string | RegExp> = [
    "/perfil",
    /^\/perfil\//,
];

function matchesAny(pathname: string, list: Array<string | RegExp>): boolean {
    return list.some(p => typeof p === "string" ? p === pathname : p.test(pathname));
}

export function middleware(request: NextRequest) {
    const staffSession = request.cookies.get('session');
    const loginAt = request.cookies.get('login_at')?.value;
    const publicSession = request.cookies.get('public_session_token');
    const { pathname } = request.nextUrl;

    // Session timeout staff (8 hours)
    if (staffSession && loginAt) {
        const loginTimestamp = parseInt(loginAt, 10);
        if (!isNaN(loginTimestamp)) {
            const eightHoursInMs = 8 * 60 * 60 * 1000;
            if (Date.now() - loginTimestamp > eightHoursInMs) {
                const response = NextResponse.next();
                response.cookies.delete('session');
                response.cookies.delete('login_at');
                return response;
            }
        }
    }

    // Rutas que requieren user público logueado
    if (matchesAny(pathname, PUBLIC_AUTH_REQUIRED)) {
        if (!publicSession) {
            const url = new URL('/ingresar', request.url);
            url.searchParams.set('next', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // Público general → pasa sin check
    if (matchesAny(pathname, PUBLIC_PATHS)) {
        return NextResponse.next();
    }

    // Rutas protegidas staff (dashboard) → requieren cookie session
    if (!staffSession && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (staffSession && pathname === '/login') {
        return NextResponse.redirect(new URL('/panel', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
