"use client";

import React from "react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
                    <div className="max-w-md w-full border border-gray-300 p-8">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 bg-accent/10 flex items-center justify-center">
                                <svg
                                    className="h-8 w-8 text-accent"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-display font-bold mb-2 text-primary">Algo salió mal</h2>
                                <p className="text-sm text-gray-600 font-sans mb-4">
                                    Ocurrió un error inesperado. Por favor, intenta recargar la página.
                                </p>
                                {this.state.error && process.env.NODE_ENV === "development" && (
                                    <details className="text-left mt-4 p-3 bg-gray-50 border border-gray-200">
                                        <summary className="cursor-pointer text-xs font-mono text-accent">
                                            Detalles del error
                                        </summary>
                                        <pre className="mt-2 text-xs overflow-auto">
                                            {this.state.error.message}
                                        </pre>
                                    </details>
                                )}
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-primary px-8 py-3 text-sm font-display font-medium text-white transition-all hover:bg-black uppercase tracking-wider"
                            >
                                Recargar página
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
