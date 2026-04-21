"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createPublicSession } from "@/lib/actions";
import { publicLoginSchema, publicSignupSchema } from "@/lib/validations";
import type { z } from "zod";

type LoginData = z.input<typeof publicLoginSchema>;
type SignupData = z.input<typeof publicSignupSchema>;

const inputClass = "w-full border border-gray-300 bg-white px-4 py-3 font-sans text-base text-primary placeholder:text-gray-400 focus:outline-none focus:border-accent";
const primaryBtnClass = "w-full border border-primary bg-primary px-6 py-4 text-[11px] font-display font-bold uppercase tracking-widest text-white hover:bg-accent hover:border-accent disabled:opacity-50";

export function AuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") || "/perfil";

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);

    const loginForm = useForm<LoginData>({ resolver: zodResolver(publicLoginSchema) });
    const signupForm = useForm<SignupData>({ resolver: zodResolver(publicSignupSchema) });

    const afterAuth = async (idToken: string) => {
        const result = await createPublicSession(idToken);
        if (result.success) {
            toast.success("Bienvenido");
            router.push(nextPath);
            router.refresh();
        } else {
            toast.error(result.error ?? "Error al crear sesión");
        }
    };

    const onLogin = async (data: LoginData) => {
        setLoading(true);
        try {
            const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
            const idToken = await cred.user.getIdToken();
            await afterAuth(idToken);
        } catch (err) {
            console.error(err);
            toast.error("Credenciales inválidas");
        } finally {
            setLoading(false);
        }
    };

    const onSignup = async (data: SignupData) => {
        setLoading(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
            if (data.displayName) {
                await updateProfile(cred.user, { displayName: data.displayName });
            }
            const idToken = await cred.user.getIdToken();
            await afterAuth(idToken);
        } catch (err) {
            console.error(err);
            toast.error("No pudimos crear la cuenta");
        } finally {
            setLoading(false);
        }
    };

    const onGoogle = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const cred = await signInWithPopup(auth, provider);
            const idToken = await cred.user.getIdToken();
            await afterAuth(idToken);
        } catch (err) {
            console.error(err);
            toast.error("Error con Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`flex-1 border px-4 py-3 text-[11px] font-display font-bold uppercase tracking-widest ${mode === "login" ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-600"}`}
                >
                    Iniciar sesión
                </button>
                <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`flex-1 border px-4 py-3 text-[11px] font-display font-bold uppercase tracking-widest ${mode === "signup" ? "border-primary bg-primary text-white" : "border-gray-300 bg-white text-gray-600"}`}
                >
                    Crear cuenta
                </button>
            </div>

            {mode === "login" ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <input type="email" {...loginForm.register("email")} placeholder="Email" className={inputClass} />
                    {loginForm.formState.errors.email && <p className="text-xs text-red-600">{loginForm.formState.errors.email.message}</p>}
                    <input type="password" {...loginForm.register("password")} placeholder="Contraseña" className={inputClass} />
                    {loginForm.formState.errors.password && <p className="text-xs text-red-600">{loginForm.formState.errors.password.message}</p>}
                    <button type="submit" disabled={loading} className={primaryBtnClass}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            ) : (
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                    <input {...signupForm.register("displayName")} placeholder="Nombre completo" className={inputClass} />
                    {signupForm.formState.errors.displayName && <p className="text-xs text-red-600">{signupForm.formState.errors.displayName.message}</p>}
                    <input type="email" {...signupForm.register("email")} placeholder="Email" className={inputClass} />
                    {signupForm.formState.errors.email && <p className="text-xs text-red-600">{signupForm.formState.errors.email.message}</p>}
                    <input type="password" {...signupForm.register("password")} placeholder="Contraseña (mín. 6)" className={inputClass} />
                    {signupForm.formState.errors.password && <p className="text-xs text-red-600">{signupForm.formState.errors.password.message}</p>}
                    <input {...signupForm.register("organization")} placeholder="Escuela u organización (opcional)" className={inputClass} />
                    <button type="submit" disabled={loading} className={primaryBtnClass}>
                        {loading ? "Creando..." : "Crear cuenta"}
                    </button>
                </form>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-[10px] font-display font-bold uppercase tracking-widest">
                    <span className="bg-white px-3 text-gray-500">O con</span>
                </div>
            </div>

            <button
                type="button"
                onClick={onGoogle}
                disabled={loading}
                className="w-full border border-gray-300 bg-white px-6 py-3 text-sm font-display font-bold text-primary hover:bg-gray-50 disabled:opacity-50"
            >
                Continuar con Google
            </button>
        </div>
    );
}
