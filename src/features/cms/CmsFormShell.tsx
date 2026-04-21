/**
 * Shell reutilizable para los formularios del CMS público.
 * Estructura: header + card con inputs + footer de acciones.
 * Los forms específicos (ObraForm, FuncionForm, etc.) componen este shell.
 */
export function CmsFormShell({
    title,
    eyebrow,
    description,
    children,
    actions,
}: {
    title: string;
    eyebrow?: string;
    description?: string;
    children: React.ReactNode;
    actions: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-10">
            <header>
                {eyebrow && (
                    <p className="text-[11px] font-display font-bold uppercase tracking-widest text-accent">
                        {eyebrow}
                    </p>
                )}
                <h1 className="mt-2 text-[54px] font-display font-bold tracking-[-2px] text-primary leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-3 font-sans text-gray-600 text-lg max-w-2xl">{description}</p>
                )}
            </header>
            <div className="border border-gray-300 p-8 bg-white">{children}</div>
            <div className="flex items-center gap-4">{actions}</div>
        </div>
    );
}

export function CmsField({
    label,
    hint,
    required,
    error,
    children,
}: {
    label: string;
    hint?: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-[11px] font-display font-bold uppercase tracking-widest text-gray-600 mb-2">
                {label} {required && <span className="text-accent">*</span>}
            </label>
            {children}
            {hint && <p className="mt-1 text-xs text-gray-500 font-sans">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-600 font-sans">{error}</p>}
        </div>
    );
}

export const cmsInputClass = "w-full border border-gray-300 bg-white px-3 py-2 font-sans text-sm text-primary placeholder:text-gray-400 focus:outline-none focus:border-accent";
