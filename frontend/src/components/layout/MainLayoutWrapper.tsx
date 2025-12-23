'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');
    const isPartnerPage = pathname.startsWith('/partner');

    if (isAdminPage || isPartnerPage) {
        return (
            <main className="flex-1">
                {children}
            </main>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-14 md:pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
}
