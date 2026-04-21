"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePublicUserLevel, deletePublicUser } from "@/lib/actions";
import type { PublicUser } from "@/types";

const NIVEL_OPTIONS = [
    { value: 0, label: "0 · Libre" },
    { value: 1, label: "1 · Bronce" },
    { value: 2, label: "2 · Plata" },
    { value: 3, label: "3 · Oro" },
    { value: 9, label: "9 · Admin" },
];

export function UsuariosList({ users }: { users: PublicUser[] }) {
    const router = useRouter();
    const [busyUid, setBusyUid] = useState<string | null>(null);

    const onNivelChange = async (uid: string, nivel: number) => {
        setBusyUid(uid);
        const result = await updatePublicUserLevel(uid, nivel);
        setBusyUid(null);
        if (result.success) {
            toast.success("Nivel actualizado");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    const onDelete = async (uid: string, email: string) => {
        if (!confirm(`¿Eliminar al usuario ${email}? Esta acción es irreversible.`)) return;
        setBusyUid(uid);
        const result = await deletePublicUser(uid);
        setBusyUid(null);
        if (result.success) {
            toast.success("Usuario eliminado");
            router.refresh();
        } else {
            toast.error(result.error ?? "Error");
        }
    };

    if (users.length === 0) {
        return <p className="py-10 text-center text-gray-500 font-sans">Sin usuarios.</p>;
    }

    return (
        <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {users.map(u => (
                <li key={u.uid} className="grid grid-cols-1 md:grid-cols-[1fr_200px_150px_80px] gap-4 items-center py-4">
                    <div>
                        <p className="text-sm font-display font-bold text-primary">{u.displayName || u.email}</p>
                        <p className="text-xs font-sans text-gray-500">{u.email}</p>
                        {u.organization && <p className="text-xs font-sans text-gray-500">{u.organization}</p>}
                    </div>
                    <select
                        value={u.nivelSuscripcion}
                        onChange={e => onNivelChange(u.uid, parseInt(e.target.value, 10))}
                        disabled={busyUid === u.uid}
                        className="w-full border border-gray-300 bg-white px-3 py-2 text-sm font-sans"
                    >
                        {NIVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <p className="text-xs font-sans text-gray-500">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("es-AR") : "—"}
                    </p>
                    <button
                        type="button"
                        onClick={() => onDelete(u.uid, u.email)}
                        disabled={busyUid === u.uid}
                        className="text-xs font-display font-bold uppercase tracking-widest text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                        Eliminar
                    </button>
                </li>
            ))}
        </ul>
    );
}
