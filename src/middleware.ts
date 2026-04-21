import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas del sitio público — NO requieren sesión.
// Incluye home, secciones principales y subtrees (fichas de obras, etc.).
const PUBLIC_PATHS: Array<string | RegExp> = [
    "/",
    "/cartelera",
    "/repertorio",
    "/nosotros",
    "/contacto",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
    /^\/repertorio\/.+/,
    /^\/cartelera\/.+/,
];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some(p => typeof p === "string" ? p === pathname : p.test(pathname));
}

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const loginAt = request.cookies.get('login_at')?.value;
    const { pathname } = request.nextUrl;

    // Session timeout (8 hours) — aplica siempre, aunque esté navegando lo público
    if (session && loginAt) {
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

    // Público → pasa sin check
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // Sin sesión en ruta protegida → login
    if (!session && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Con sesión visitando /login → al panel
    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/panel', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
