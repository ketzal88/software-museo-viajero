"use client";

import { useState, useEffect } from "react";
import { Landmark, Eye, EyeOff, Loader2 } from "lucide-react";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function LoginPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            router.push("/");
        }
    }, [user, authLoading, router]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Set cookie for middleware
            document.cookie = "session=true; path=/; max-age=86400; SameSite=Lax";
            router.push("/");
        } catch (err: unknown) {
            console.error("Login error:", err);
            setError("Credenciales inválidas. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            // Set cookie for middleware
            document.cookie = "session=true; path=/; max-age=86400; SameSite=Lax";
            router.push("/");
        } catch (err: unknown) {
            console.error("Google login error:", err);
            setError("Error al iniciar sesión con Google.");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen font-sans bg-background-light dark:bg-background-dark">
            {/* Left Section: Login Form */}
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[40%] xl:w-[35%] bg-white dark:bg-background-dark">
                <div className="mx-auto w-full max-w-sm">
                    {/* Header/Logo Area */}
                    <div className="mb-10 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                                <Landmark className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-black tracking-tight text-[#111418] dark:text-white leading-none">Museo Viajero</h1>
                                <span className="text-sm font-medium text-primary/80 mt-1">Gestión de Operadores</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-[#111418] dark:text-white">Bienvenido</h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales para acceder al sistema.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-[#111418] dark:text-gray-200">
                                Correo electrónico
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ejemplo@museoviajero.com"
                                    className="block w-full rounded-lg border-0 py-3 text-[#111418] shadow-sm ring-1 ring-inset ring-[#dbe0e6] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-[#1a2530] dark:ring-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-semibold leading-6 text-[#111418] dark:text-gray-200">
                                    Contraseña
                                </label>
                                <div className="text-sm">
                                    <button type="button" className="font-semibold text-primary hover:text-primary/80">
                                        ¿Olvidó su contraseña?
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full rounded-lg border-0 py-3 text-[#111418] shadow-sm ring-1 ring-inset ring-[#dbe0e6] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 dark:bg-[#1a2530] dark:ring-gray-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center items-center gap-2 rounded-lg bg-primary px-3 py-3 text-sm font-bold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar Sesión"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10">
                        <div className="relative">
                            <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm font-medium leading-6">
                                <span className="bg-white px-2 text-gray-500 dark:bg-background-dark dark:text-gray-400 uppercase tracking-widest text-[10px]">
                                    O continuar con
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-3 py-3 text-sm font-bold text-[#111418] shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent transition-all dark:bg-transparent dark:text-white dark:ring-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span className="text-sm font-semibold leading-6">Continuar con Google</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        ¿No tienes acceso?{" "}
                        <button type="button" className="font-semibold leading-6 text-primary hover:text-primary/80">
                            Solicitar cuenta
                        </button>
                    </p>
                </div>

                {/* Footer Small Print */}
                <div className="mt-auto pt-10 text-center lg:text-left">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">© 2024 Museo Viajero. Sistema de Gestión Interna.</p>
                </div>
            </div>

            {/* Right Section: Image */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div
                    className="absolute inset-0 h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBH5Y-4mjtPrsWemA7VcZr23ofhZWxpaWLVgll5Bezu_d2_HDb8pPPCoBZX3HJPPBuouKqGR4psUOljlmNjRps0XBftcZ9L3kZCAMr3oXaG48lu7TsGwFl_AELzkDTeSnLrbX95Nu5JA2StCQO6Owtfsheawy1BHilgmkxCtHc_0rWl-KbUHqFPmMH1GqSZRUxlyneEMpG0-9fypqVErrnUOKIIWLTpQ0hkrXfoMYuykhIe0z_WT0aR8JEzVbRgQ15McVko1kACgCI')" }}
                >
                    {/* Overlay to tie into brand */}
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent"></div>
                </div>

                {/* Branding Overlay Content */}
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <div className="max-w-xl">
                        <span className="inline-block px-3 py-1 bg-primary/30 backdrop-blur-md rounded-full text-xs font-bold tracking-widest uppercase mb-4">Misión Cultural</span>
                        <h3 className="text-4xl font-bold leading-tight mb-4">Llevando la historia y el arte a cada rincón del mundo.</h3>
                        <p className="text-lg text-gray-200">Plataforma de coordinación logística para operadores del Museo Viajero. Administra funciones, reservas y giras culturales en tiempo real.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
