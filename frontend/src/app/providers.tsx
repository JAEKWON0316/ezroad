'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                retry: 1,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        className: '',
                        style: {
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '12px 20px',
                            color: '#1f2937',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            borderRadius: '1rem',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                        },
                        success: {
                            iconTheme: {
                                primary: '#f97316', // orange-500
                                secondary: '#fff',
                            },
                            style: {
                                border: '1px solid rgba(249, 115, 22, 0.2)',
                            }
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444', // red-500
                                secondary: '#fff',
                            },
                            style: {
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                            }
                        },
                    }}
                />
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
