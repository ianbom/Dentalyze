import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { logout, dashboard } from '@/routes';
import { edit as editProfile } from '@/routes/profile';

type PatientHeaderProps = {
    localAnchors?: boolean;
};

export default function PatientHeader({
    localAnchors = false,
}: PatientHeaderProps) {
    const dashboardUrl = dashboard.url();
    const [activeSection, setActiveSection] = useState('riwayat');
    const anchorHref = (hash: string) =>
        localAnchors ? `#${hash}` : `${dashboardUrl}#${hash}`;

    useEffect(() => {
        if (!localAnchors) {
return;
}

        const observer = new IntersectionObserver((entries) => {
            const visible = entries.find((entry) => entry.isIntersecting);

            if (visible) {
setActiveSection(visible.target.id);
}
        }, { rootMargin: '-25% 0px -60%', threshold: 0.15 });
        ['riwayat', 'insight', 'contact'].forEach((id) => {
            const element = document.getElementById(id);

            if (element) {
observer.observe(element);
}
        });

        return () => observer.disconnect();
    }, [localAnchors]);

    return (
        <header className="fixed top-0 right-0 left-0 z-[999] border-b border-white/30 bg-white/10 px-12 py-5 backdrop-blur-xl lg:px-20">
            <div className="flex w-full items-center">
                {/* LEFT */}
                <div className="flex flex-1">
                    <a
                        href={localAnchors ? '#top' : dashboardUrl}
                        className="flex items-center gap-1"
                    >
                        <img
                            src="/asset/images/logo.png"
                            alt="Dentalyze AI"
                            className="h-11 w-11 object-contain"
                        />

                        <div className="text-2xl font-black tracking-tight text-[#1aa0ff] lg:text-[34px]">
                            DENTA
                            <span className="text-[#187df0]">LYZE</span>
                        </div>
                    </a>
                </div>

                {/* CENTER */}
                <nav className="hidden items-center justify-center gap-16 text-[11px] font-black tracking-[0.28em] text-[#98a3b5] uppercase lg:flex">
                    <a
                        href={anchorHref('riwayat')}
                        className={`border-b-2 pb-2 transition ${activeSection === 'riwayat' ? 'border-[#13b8ff] text-[#0878e8]' : 'border-transparent hover:text-[#13b8ff]'}`}
                    >
                        Riwayat
                    </a>

                    <a
                        href={anchorHref('insight')}
                        className={`border-b-2 pb-2 transition ${activeSection === 'insight' ? 'border-[#13b8ff] text-[#0878e8]' : 'border-transparent hover:text-[#13b8ff]'}`}
                    >
                        Insight
                    </a>

                    <a
                        href={anchorHref('contact')}
                        className={`border-b-2 pb-2 transition ${activeSection === 'contact' ? 'border-[#13b8ff] text-[#0878e8]' : 'border-transparent hover:text-[#13b8ff]'}`}
                    >
                        Contact Us
                    </a>

                    <Link
                        href="/ai-chat"
                        className="transition hover:text-[#13b8ff]"
                    >
                        AI Chat
                    </Link>
                </nav>

                {/* RIGHT */}
                <div className="flex flex-1 items-center justify-end gap-4">
                    <Link
                        href={editProfile()}
                        className="rounded-[12px] bg-[#49ddd7] px-8 py-4 text-xs font-black tracking-widest text-white uppercase shadow-lg transition hover:scale-105"
                    >
                        Profile
                    </Link>

                    <Link
                        href={logout()}
                        method="post"
                        as="button"
                        className="rounded-[12px] bg-[#ef4444] px-8 py-4 text-xs font-black tracking-widest text-white uppercase shadow-lg transition hover:scale-105"
                    >
                        Logout
                    </Link>
                </div>
            </div>
        </header>
    );
}
