import {
    BookOpen,
    Clock3,
    Mail,
    MapPin,
    MessageCircleMore,
    PhoneCall,
} from 'lucide-react';
import NewsletterForm from '@/components/newsletter-form';

export default function PatientFooter({
    className = '',
}: {
    className?: string;
}) {
    return (
        <footer
            id="contact"
            className={`relative z-30 overflow-hidden rounded-t-[46px] border-t border-white/40 bg-[linear-gradient(135deg,#eaf8ff_0%,#eefaff_32%,#dff6ff_62%,#f8fcff_100%)] px-8 pt-16 pb-8 text-[#1b1b18] shadow-[0_-24px_70px_rgba(19,184,255,0.08)] lg:px-16 ${className}`}
        >
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-24 left-[-120px] h-[420px] w-[420px] rounded-full bg-[#13b8ff]/14 blur-[120px]" />
                <div className="absolute top-[10%] right-[-100px] h-[380px] w-[380px] rounded-full bg-[#49ddd7]/16 blur-[120px]" />
                <div className="absolute bottom-[-160px] left-[40%] h-[420px] w-[420px] rounded-full bg-[#86d8ff]/14 blur-[130px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(8,120,232,0.18)_1px,transparent_0)] [background-size:34px_34px] opacity-[0.18]" />
            </div>

            <div className="relative z-10">
                <div className="grid grid-cols-1 gap-14 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_0.9fr_1.1fr]">
                    <div>
                        <div className="flex items-center gap-1">
                            <img
                                src="/asset/images/logo.png"
                                alt="Dentalyze AI"
                                className="h-11 w-11 object-contain"
                            />
                            <div className="text-3xl font-black tracking-tight text-[#1aa0ff]">
                                DENTA
                                <span className="text-[#187df0]">LYZE</span>
                            </div>
                        </div>

                        <p className="mt-5 max-w-[320px] text-[15px] leading-[1.8] text-[#808999]">
                            Platform AI dental intelligence untuk membantu
                            analisis radiografi gigi, enumerasi gigi, serta
                            deteksi kelainan secara lebih cepat dan rapi.
                        </p>

                        <div className="mt-8 flex items-center gap-4">
                            {[
                                [BookOpen, '#top'],
                                [MessageCircleMore, 'https://wa.me/6281336730560?text=Halo%20Dentalyze%2C%20saya%20ingin%20berkonsultasi.'],
                                [PhoneCall, 'https://wa.me/6281336730560?text=Halo%20Dentalyze%2C%20mohon%20hubungi%20saya.'],
                            ].map(([Icon, href], index) => (
                                    <a
                                        href={href as string}
                                        className="group flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/70 bg-white/45 text-[#0878e8] shadow-[0_12px_25px_rgba(19,184,255,0.08)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:bg-[#0878e8] hover:text-white"
                                        key={index}
                                        rel={String(href).startsWith('http') ? 'noreferrer' : undefined}
                                        target={String(href).startsWith('http') ? '_blank' : undefined}
                                    >
                                        <Icon size={18} strokeWidth={2.1} />
                                    </a>
                                ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[15px] font-black tracking-[0.26em] text-[#0878e8] uppercase">
                            Navigasi
                        </h4>
                        <ul className="mt-7 space-y-4">
                            {[
                                ['Dashboard', '#dashboard'],
                                ['Riwayat', '#riwayat'],
                                ['Insight', '/patient-insight'],
                                ['Contact Us', '#contact'],
                            ].map(([label, href]) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        className="group flex items-center gap-3 text-[15px] font-semibold text-[#808999] transition hover:text-[#0878e8]"
                                    >
                                        <span className="h-2 w-2 rounded-full bg-[#49ddd7] transition group-hover:scale-125" />
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[13px] font-black tracking-[0.34em] text-[#0878e8] uppercase">
                            Hubungi Kami
                        </h4>
                        <ul className="mt-6 space-y-6 text-[15px] text-[#808999]">
                            <FooterContact icon={MapPin} text="Indonesia" />
                            <FooterContact
                                icon={Mail}
                                text="support@dentalyze.id"
                            />
                            <FooterContact icon={Clock3} text="09:00 / 17:00" />
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[15px] font-black tracking-[0.26em] text-[#0878e8] uppercase">
                            Newsletter
                        </h4>
                        <p className="mt-7 text-[15px] leading-[1.8] text-[#808999]">
                            Dapatkan update fitur AI Dentalyze, teknologi
                            deteksi gigi, dan pengembangan sistem terbaru.
                        </p>
                        <NewsletterForm />
                    </div>
                </div>

                <div className="mt-16 border-t border-[#0878e8]/10 pt-8">
                    <div className="flex flex-col items-center justify-between gap-5 text-[14px] text-[#9ea6b6] md:flex-row">
                        <p>
                            © 2026 Dentalyze AI — AI Powered Dental Disease
                            Detection and Analysis System. All rights reserved.
                        </p>
                        <div className="flex gap-7">
                            <a
                                href="#"
                                className="transition hover:text-[#0878e8]"
                            >
                                Kebijakan Privasi
                            </a>
                            <a
                                href="#"
                                className="transition hover:text-[#0878e8]"
                            >
                                Syarat & Ketentuan
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterContact({
    icon: Icon,
    text,
}: {
    icon: typeof MapPin;
    text: string;
}) {
    return (
        <li className="flex items-center gap-4">
            <span className="flex h-5 w-5 items-center justify-center text-[#49ddd7]">
                <Icon size={18} strokeWidth={2.2} />
            </span>
            <span>{text}</span>
        </li>
    );
}
