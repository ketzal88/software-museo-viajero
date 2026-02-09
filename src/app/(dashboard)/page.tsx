"use client";

import { getTestCollection } from "@/lib/actions";
import { useState } from "react";
import { School } from "@/types";
import { SchoolAutocomplete } from "@/features/schools/components/SchoolAutocomplete";

export default function Home() {
  const [status, setStatus] = useState<string>("Boton para probar Firebase");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const handleTest = async () => {
    setStatus("Probando...");
    const result = await getTestCollection();
    setStatus(result.message);
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Soft Museo Viajero
        </h1>
        <p className="text-muted-foreground text-lg mt-2">Bienvenido al núcleo de gestión operativa.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg mb-2">Infraestructura</h3>
          <p className="text-sm text-muted-foreground mb-4">Estado de Firebase: {status}</p>
          <button
            onClick={handleTest}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-semibold"
          >
            Verificar Conexión
          </button>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg mb-2">Buscador Inteligente</h3>
          <p className="text-sm text-muted-foreground mb-4">Prueba el autocomplete de escuelas:</p>
          <SchoolAutocomplete
            onSelect={(school) => setSelectedSchool(school)}
            placeholder="Escribe 'Escuela'..."
          />
          {selectedSchool && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-1">
              <p className="text-xs font-bold text-primary uppercase">Seleccionada:</p>
              <p className="text-sm font-semibold">{selectedSchool.name}</p>
              <p className="text-xs text-muted-foreground">{selectedSchool.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

