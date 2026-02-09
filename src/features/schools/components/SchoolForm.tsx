"use client";

import { useState } from "react";
import { School } from "@/types";
import { addSchool, updateSchool } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { MapPin, Phone, User, Mail, FileText, Building2 } from "lucide-react";

interface SchoolFormProps {
    initialData?: School;
}

export function SchoolForm({ initialData }: SchoolFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<School, "id" | "searchTokens" | "displayLabel">>({
        name: initialData?.name || "",
        address: initialData?.address || "",
        district: initialData?.district || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        isPrivate: initialData?.isPrivate || false,
        contactName: initialData?.contactName || "",
        notes: initialData?.notes || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateSchool(initialData.id, formData);
            } else {
                await addSchool(formData);
            }
            router.push("/escuelas");
            router.refresh();
        } catch (error) {
            console.error("Error saving school:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Nombre de la Escuela</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                            placeholder="Ej: Escuela N° 1"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Gestión</label>
                    <select
                        value={formData.isPrivate ? "private" : "public"}
                        onChange={(e) => setFormData({ ...formData, isPrivate: e.target.value === "private" })}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    >
                        <option value="public">Pública / Estatal</option>
                        <option value="private">Privada</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Barrio / Comuna / Distrito</label>
                    <input
                        required
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                        placeholder="Ej: Caballito"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Dirección</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                            placeholder="Calle 123, Ciudad"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Responsable / Contacto</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            required
                            value={formData.contactName}
                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Teléfono</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Notas</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full min-h-[100px] rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium"
                >
                    {loading ? "Guardando..." : initialData ? "Actualizar Escuela" : "Crear Escuela"}
                </button>
            </div>
        </form>
    );
}
