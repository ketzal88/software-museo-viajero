import Link from "next/link";

export default function DashboardNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="text-center space-y-3">
                <p className="text-[120px] font-display font-bold text-gray-200 leading-none">
                    404
                </p>
                <h2 className="text-2xl font-display font-bold text-primary">
                    Página no encontrada
                </h2>
                <p className="text-gray-600 font-sans max-w-md">
                    El recurso que buscas no existe o fue movido.
                </p>
            </div>
            <Link
                href="/"
                className="px-8 py-3.5 bg-primary text-white text-sm font-display font-medium transition-all hover:bg-black uppercase tracking-wider"
            >
                Volver al Inicio
            </Link>
        </div>
    );
}
