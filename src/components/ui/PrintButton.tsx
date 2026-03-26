"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="print:hidden flex items-center gap-2 border border-gray-300 px-4 py-2 text-sm font-display font-medium text-gray-600 hover:bg-gray-50 transition-colors uppercase tracking-wider"
        >
            <Printer className="h-4 w-4" />
            Imprimir
        </button>
    );
}
