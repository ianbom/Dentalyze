import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bot,
    Camera,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    LogOut,
    BrainCircuit,
    Scan,
    Settings,
    ShieldCheck,
    Stethoscope,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import AiChatWidget from '@/components/ai-chat-widget';
import PatientHeader from '@/components/patient-header';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import detection from '@/routes/detection';
import doctors from '@/routes/doctors';
import knowledge from '@/routes/knowledge';
import patients from '@/routes/patients';
import { edit as editProfile } from '@/routes/profile';
import radiographers from '@/routes/radiographers';
import * as radiographHistory from '@/routes/radiographs/history';
import verification from '@/routes/verification';

const navItems = [
    {
        label: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
        roles: ['admin', 'radiografer', 'dokter'],
    },
    {
        label: 'Deteksi Penyakit',
        href: detection.index(),
        icon: Scan,
        roles: ['admin', 'radiografer', 'dokter'],
    },
    {
        label: 'Data Radiografer',
        href: radiographers.index(),
        icon: Camera,
        roles: ['admin'],
    },
    {
        label: 'Data Dokter',
        href: doctors.index(),
        icon: Stethoscope,
        roles: ['admin'],
    },
    {
        label: 'Data Pasien',
        href: patients.index(),
        icon: Users,
        roles: ['admin', 'radiografer', 'dokter'],
    },
    {
        label: 'Riwayat Deteksi',
        href: radiographHistory.index(),
        icon: Activity,
        roles: ['admin', 'radiografer', 'dokter'],
    },
    {
        label: 'Tugas Verifikasi',
        href: verification.tasks(),
        icon: ShieldCheck,
        roles: ['admin', 'dokter'],
    },
    {
        label: 'AI Chat',
        href: '/ai-chat',
        icon: Bot,
        roles: ['admin', 'radiografer', 'dokter'],
    },
    {
        label: 'Knowledge Base',
        href: knowledge.index(),
        icon: BrainCircuit,
        roles: ['admin'],
    },
    {
        label: 'Profile Settings',
        href: editProfile(),
        icon: Settings,
        roles: ['admin', 'radiografer', 'dokter'],
    },
];

function Sidebar({ role }: { role: string }) {
    const { isCurrentOrParentUrl, isCurrentUrl } = useCurrentUrl();

    const [collapsed, setCollapsed] = useState(false);
    const visibleItems = navItems.filter((item) => item.roles.includes(role));

    return (
        <aside className={`hc-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
            <div className="hc-brand-row">
                <button
                    className="hc-brand-pill"
                    onClick={() => setCollapsed(!collapsed)}
                    type="button"
                >
                    <img
                        alt="Dentalyze AI"
                        className="hc-brand-logo"
                        src="/asset/images/logo.png"
                    />

                    {!collapsed && (
                        <span className="hc-brand-name">
                            DENTA<span>LYZE</span>
                        </span>
                    )}

                    <div className="hc-brand-arrow">
                        {collapsed ? (
                            <ChevronRight size={14} strokeWidth={2.5} />
                        ) : (
                            <ChevronDown size={14} strokeWidth={2.5} />
                        )}
                    </div>
                </button>
            </div>

            <nav className="hc-nav">
                {visibleItems.map((item) => {
                    const ItemIcon = item.icon;
                    const href =
                        typeof item.href === 'string'
                            ? item.href
                            : item.href.url;
                    const isActive =
                        href === '#'
                            ? isCurrentUrl(href)
                            : isCurrentOrParentUrl(href);

                    return (
                        <Link
                            className={`hc-nav-item ${
                                isActive ? 'is-active' : ''
                            }`}
                            href={item.href}
                            key={item.label}
                            prefetch
                        >
                            <ItemIcon size={16} strokeWidth={2} />

                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="hc-profile-card">
                <MedicalIllustration />

                <h3>Dentalyze AI</h3>

                <p>AI radiograph analysis workspace</p>

                <Link href={editProfile()}>My Profile</Link>
            </div>

            <button
                className="hc-nav-item hc-logout-button"
                onClick={() => router.post('/logout')}
                type="button"
            >
                <LogOut size={16} strokeWidth={2} />

                <span>Logout</span>
            </button>
        </aside>
    );
}

function MedicalIllustration() {
    return (
        <svg
            aria-hidden="true"
            className="hc-medical-illustration"
            viewBox="0 0 180 122"
        >
            <defs>
                <linearGradient id="ill-bg" x1="0" x2="1" y1="0" y2="1">
                    <stop stopColor="#E9F6FF" />
                    <stop offset="1" stopColor="#D8EBFF" />
                </linearGradient>
                <linearGradient id="ill-core" x1="0" x2="1" y1="0" y2="1">
                    <stop stopColor="#13B8FF" />
                    <stop offset="1" stopColor="#49DDD7" />
                </linearGradient>
            </defs>
            <path
                d="M22 84C14 57 33 22 70 17c42-6 82 9 94 41 9 26-12 44-47 49-43 7-84 8-95-23Z"
                fill="url(#ill-bg)"
            />
            <path d="M32 93h116" stroke="#C8DDF3" strokeLinecap="round" />
            <path
                d="M74 22c14-9 35-4 42 12 8 19 0 47-14 63-6 7-11 5-13-4l-3-15c-1-5-8-5-9 0l-3 15c-2 9-8 11-14 4-14-16-22-44-14-63 5-12 17-18 28-12Z"
                fill="#FFFFFF"
                opacity=".98"
            />
            <path
                d="M65 48h15l5-11 8 27 6-16h16"
                fill="none"
                stroke="url(#ill-core)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
            />
            <circle cx="44" cy="54" r="6" fill="#13B8FF" opacity=".28" />
            <circle cx="137" cy="47" r="8" fill="#49DDD7" opacity=".32" />
            <path
                d="M39 78h23M118 78h24M54 88h72"
                stroke="#9DC9F8"
                strokeLinecap="round"
                strokeWidth="3"
            />
        </svg>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { auth } = usePage().props as {
        auth?: { user?: { role?: string } };
    };
    const role = auth?.user?.role ?? 'admin';

    if (role === 'pasien') {
        return (
            <main className="min-h-screen bg-[linear-gradient(180deg,#eef8ff_0%,#edf8ff_35%,#f7fbff_100%)] pt-[120px] pb-8">
                <PatientHeader />
                {children}
                <AiChatWidget />
            </main>
        );
    }

    return (
        <main className="hc-root-layout">
            <div className="hc-dashboard-shell">
                <div className="hc-app-layout">
                    <Sidebar role={role} />
                    <section className="hc-main-panel">
                        <div className="hc-layout-slot">{children}</div>
                        <footer>
                            © 2026 Dentalyze AI — AI Powered Dental Disease
                            Detection and Analysis System. All rights reserved.
                        </footer>
                    </section>
                </div>
            </div>
            <AiChatWidget />
        </main>
    );
}
