"use client";

import { useState } from "react";
import { Venue } from "@/types";
import { addVenue, updateVenue } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { MapPin, Users, Phone, User, FileText } from "lucide-react";

interface VenueFormProps {
    initialData?: Venue;
}

export function VenueForm({ initialData }: VenueFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<Venue, "id">>({
        name: initialData?.name || "",
        address: initialData?.address || initialData?.addressLine || "",
        addressLine: initialData?.addressLine || initialData?.address || "",
        mapsUrl: initialData?.mapsUrl || "",
        defaultCapacity: initialData?.defaultCapacity || 0,
        contactName: initialData?.contactName || "",
        phone: initialData?.phone || "",
        notes: initialData?.notes || "",
        defaultSlotTemplate: initialData?.defaultSlotTemplate || [],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData?.id) {
                await updateVenue(initialData.id, formData);
            } else {
                await addVenue(formData);
            }
            router.push("/teatros");
            router.refresh();
        } catch (error) {
            console.error("Error saving venue:", error);
        } finally {
            setLoading(false);
        }
    };

    // Slot functions temporarily removed - needs refactor

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Teatro</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                            placeholder="Ej: Teatro Broadway"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Capacidad Default</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="number"
                            required
                            value={formData.defaultCapacity}
                            onChange={(e) => setFormData({ ...formData, defaultCapacity: parseInt(e.target.value) })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Dirección</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            required
                            value={formData.address || formData.addressLine || ""}
                            onChange={(e) => setFormData({
                                ...formData,
                                address: e.target.value,
                                addressLine: e.target.value
                            })}
                            className="w-full rounded-md border bg-background px-9 py-2 text-sm focus:ring-2 focus:ring-primary"
                            placeholder="Calle 123, Ciudad"
                        />
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Google Maps URL</label>
                    <input
                        type="url"
                        value={formData.mapsUrl}
                        onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                        placeholder="https://maps.google.com/..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Persona de Contacto</label>
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
                    <label className="text-sm font-medium">Notas</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Slot template temporarily disabled - needs refactor */}
            {/*
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Template de Horarios (Slots)</h3>
                </div>
                <p className="text-sm text-muted-foreground italic">Funcionalidad de slots en desarrollo.</p>
            </div>
            */}

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
                    {loading ? "Guardando..." : initialData ? "Actualizar Teatro" : "Crear Teatro"}
                </button>
            </div>
        </form>
    );
}
