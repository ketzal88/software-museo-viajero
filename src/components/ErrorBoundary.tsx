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
                <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
                    <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-lg">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <svg
                                    className="h-8 w-8 text-destructive"
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
                                <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Ocurrió un error inesperado. Por favor, intenta recargar la página.
                                </p>
                                {this.state.error && process.env.NODE_ENV === "development" && (
                                    <details className="text-left mt-4 p-3 bg-muted rounded-lg">
                                        <summary className="cursor-pointer text-xs font-mono text-destructive">
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
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
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
